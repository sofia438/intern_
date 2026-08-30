"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  CompanyProfileFormSchema,
  ProductFormSchema,
  ReferenceWebsiteFormSchema,
  type FormState,
} from "@/lib/definitions";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function readImage(formData: FormData): Promise<{ image?: Uint8Array<ArrayBuffer>; imageType?: string } | { error: string }> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return {};
  if (file.size > MAX_IMAGE_BYTES) return { error: "Image is too large (max 5MB)." };

  return {
    image: Uint8Array.from(Buffer.from(await file.arrayBuffer())) as Uint8Array<ArrayBuffer>,
    imageType: file.type || undefined,
  };
}

export async function saveCompanyProfile(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = CompanyProfileFormSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    companyName: formData.get("companyName"),
    website: formData.get("website")?.toString() ?? "",
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const { fullName, companyName, website } = validatedFields.data;

  try {
    await prisma.company.update({
      where: { id: session.companyId },
      data: { name: companyName, website: website || null },
    });
    if (fullName) {
      await prisma.user.update({ where: { id: session.userId }, data: { name: fullName } });
    }
  } catch (error) {
    console.error("Failed to save company profile", error);
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
  return { message: "Company profile saved." };
}

export async function addProduct(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    englishName: formData.get("englishName"),
    hsCode: formData.get("hsCode"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const imageResult = await readImage(formData);
  if ("error" in imageResult) {
    return { message: imageResult.error };
  }

  try {
    await prisma.product.create({
      data: {
        companyId: session.companyId,
        name: validatedFields.data.name,
        englishName: validatedFields.data.englishName || null,
        hsCode: validatedFields.data.hsCode || null,
        image: imageResult.image ?? null,
        imageType: imageResult.imageType ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to add product", error);
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
  revalidatePath("/lead-finder");
  return { message: "Product added." };
}

export async function updateProduct(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const productId = formData.get("productId")?.toString();
  if (!productId) return { message: "Missing product." };

  const validatedFields = ProductFormSchema.safeParse({
    name: formData.get("name"),
    englishName: formData.get("englishName"),
    hsCode: formData.get("hsCode"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const imageResult = await readImage(formData);
  if ("error" in imageResult) {
    return { message: imageResult.error };
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.companyId !== session.companyId) {
      return { message: "Product not found." };
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        name: validatedFields.data.name,
        englishName: validatedFields.data.englishName || null,
        hsCode: validatedFields.data.hsCode || null,
        ...(imageResult.image ? { image: imageResult.image, imageType: imageResult.imageType ?? null } : {}),
      },
    });
  } catch (error) {
    console.error("Failed to update product", error);
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
  revalidatePath("/lead-finder");
  return { message: "Product updated." };
}

export async function deleteProduct(formData: FormData): Promise<void> {
  const session = await verifySession();
  const productId = formData.get("productId")?.toString();
  if (!productId) return;

  const existing = await prisma.product.findUnique({ where: { id: productId } });
  if (!existing || existing.companyId !== session.companyId) return;

  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
  revalidatePath("/lead-finder");
}

export async function addReferenceWebsite(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = ReferenceWebsiteFormSchema.safeParse({ url: formData.get("url") });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    await prisma.referenceWebsite.create({
      data: { companyId: session.companyId, url: validatedFields.data.url },
    });
  } catch (error) {
    console.error("Failed to add reference website", error);
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
  return { message: "Reference website added." };
}

export async function updateReferenceWebsite(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const id = formData.get("id")?.toString();
  if (!id) return { message: "Missing reference website." };

  const validatedFields = ReferenceWebsiteFormSchema.safeParse({ url: formData.get("url") });
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const existing = await prisma.referenceWebsite.findUnique({ where: { id } });
    if (!existing || existing.companyId !== session.companyId) {
      return { message: "Reference website not found." };
    }

    await prisma.referenceWebsite.update({ where: { id }, data: { url: validatedFields.data.url } });
  } catch (error) {
    console.error("Failed to update reference website", error);
    return { message: "Something went wrong. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
  return { message: "Reference website updated." };
}

export async function deleteReferenceWebsite(formData: FormData): Promise<void> {
  const session = await verifySession();
  const id = formData.get("id")?.toString();
  if (!id) return;

  const existing = await prisma.referenceWebsite.findUnique({ where: { id } });
  if (!existing || existing.companyId !== session.companyId) return;

  await prisma.referenceWebsite.delete({ where: { id } });

  revalidatePath("/settings");
  revalidatePath("/profile-setup");
}

export async function completeProfileSetup(): Promise<void> {
  const session = await verifySession();

  await prisma.company.update({
    where: { id: session.companyId },
    data: { profileCompletedAt: new Date() },
  });

  redirect("/dashboard");
}
