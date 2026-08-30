"use server";

import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { createSession, deleteSession } from "@/lib/session";
import { verifySession } from "@/lib/dal";
import {
  RegisterFormSchema,
  LoginFormSchema,
  ForgotPasswordFormSchema,
  ResetPasswordFormSchema,
  UpdateProfileFormSchema,
  type FormState,
} from "@/lib/definitions";

const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function register(_prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = RegisterFormSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { companyName, name, email, password } = validatedFields.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { errors: { email: ["An account with this email already exists"] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  let session;
  try {
    session = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const company = await tx.company.create({ data: { name: companyName } });
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          name,
          email,
          passwordHash,
          role: "ADMIN",
        },
      });
      await tx.chatbot.create({ data: { companyId: company.id } });
      return { userId: user.id, companyId: company.id, role: user.role };
    });
  } catch {
    return { message: "Something went wrong while creating your account. Please try again." };
  }

  await createSession(session);
  redirect("/dashboard");
}

export async function login(_prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { message: "Something went wrong. Please try again." };
  }

  if (!user || !user.passwordHash) {
    return { message: "Invalid email or password" };
  }

  const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordsMatch) {
    return { message: "Invalid email or password" };
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await createSession({ userId: user.id, companyId: user.companyId, role: user.role });
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function requestPasswordReset(_prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ForgotPasswordFormSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { email } = validatedFields.data;
  const successState: FormState = { message: "If an account exists for that email, we've sent a password reset link." };

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("Failed to look up user for password reset", error);
    return { message: "Something went wrong. Please try again." };
  }

  if (!user) {
    // Do not reveal whether the account exists.
    return successState;
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);

  try {
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });
  } catch (error) {
    console.error("Failed to create password reset token", error);
    return { message: "Something went wrong. Please try again." };
  }

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${rawToken}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "GlobalExpo <onboarding@resend.dev>",
      to: email,
      subject: "Reset your GlobalExpo password",
      html: `<p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });
  } catch (error) {
    console.error("Failed to send password reset email", error);
  }

  return successState;
}

export async function resetPassword(token: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = ResetPasswordFormSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const tokenHash = hashToken(token);

  let resetToken;
  try {
    resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  } catch (error) {
    console.error("Failed to look up password reset token", error);
    return { message: "Something went wrong. Please try again." };
  }

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { message: "This password reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(validatedFields.data.password, 10);

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ]);
  } catch (error) {
    console.error("Failed to reset password", error);
    return { message: "Something went wrong. Please try again." };
  }

  redirect("/login");
}

export async function updateProfile(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = UpdateProfileFormSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { name: validatedFields.data.name },
    });
  } catch (error) {
    console.error("Failed to update profile", error);
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/settings");
  return { message: "Profile updated." };
}
