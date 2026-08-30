import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { createSession } from "@/lib/session";
import { exchangeCodeForTokens, verifyIdToken } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const raw = cookieStore.get("google_oauth")?.value;
  cookieStore.delete("google_oauth");

  if (!code || !state || !raw) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  let stored: { state: string; codeVerifier: string };
  try {
    stored = JSON.parse(raw);
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  if (stored.state !== state) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const tokens = await exchangeCodeForTokens(code, stored.codeVerifier);
  if (!tokens) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const googleUser = await verifyIdToken(tokens.idToken);
  if (!googleUser || !googleUser.email || !googleUser.emailVerified) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  if (!googleUser.email.toLowerCase().endsWith("@gmail.com")) {
    return NextResponse.redirect(new URL("/login?error=oauth_gmail_only", request.url));
  }

  const email = googleUser.email;

  let user = await prisma.user.findUnique({ where: { googleId: googleUser.sub } });

  if (!user) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return NextResponse.redirect(new URL("/login?error=oauth_email_taken", request.url));
    }

    const companyName = googleUser.name ? `${googleUser.name}'s Company` : "My Company";

    try {
      user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const company = await tx.company.create({ data: { name: companyName } });
        const createdUser = await tx.user.create({
          data: {
            companyId: company.id,
            name: googleUser.name ?? email.split("@")[0],
            email,
            googleId: googleUser.sub,
            role: "ADMIN",
          },
        });
        await tx.chatbot.create({ data: { companyId: company.id } });
        return createdUser;
      });
    } catch {
      
      user = await prisma.user.findUnique({ where: { googleId: googleUser.sub } });
      if (!user) {
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
      }
    }
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession({ userId: user.id, companyId: user.companyId, role: user.role });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
