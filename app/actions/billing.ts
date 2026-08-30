"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { CheckoutFormSchema } from "@/lib/definitions";
import { PLANS, isPlanId } from "@/lib/billing/plans";
import { mockChargeCard, PAYMENT_DECLINE_MESSAGES } from "@/lib/billing/paymentProvider";


export type CheckoutFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      values?: {
        fullName: string;
        country: string;
        address: string;
        city: string;
        postalCode: string;
        taxId: string;
        billingEmail: string;
      };
    }
  | undefined;

export async function checkout(_prevState: CheckoutFormState, formData: FormData): Promise<CheckoutFormState> {
  const session = await verifySession();

  const submittedValues = {
    fullName: String(formData.get("fullName") ?? ""),
    country: String(formData.get("country") ?? ""),
    address: String(formData.get("address") ?? ""),
    city: String(formData.get("city") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    taxId: String(formData.get("taxId") ?? ""),
    billingEmail: String(formData.get("billingEmail") ?? ""),
  };

  const validated = CheckoutFormSchema.safeParse({
    planId: formData.get("planId"),
    fullName: formData.get("fullName"),
    country: formData.get("country"),
    address: formData.get("address"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    taxId: formData.get("taxId") || undefined,
    billingEmail: formData.get("billingEmail"),
    cardNumber: formData.get("cardNumber"),
    expiryMonth: formData.get("expiryMonth"),
    expiryYear: formData.get("expiryYear"),
    cvc: formData.get("cvc"),
    cardholderName: formData.get("cardholderName"),
    agreeTerms: formData.get("agreeTerms"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, values: submittedValues };
  }

  const data = validated.data;
  if (!isPlanId(data.planId)) {
    return { message: "Select a valid plan.", values: submittedValues };
  }
  const plan = PLANS.find((p) => p.id === data.planId)!;

  const result = mockChargeCard(data.cardNumber);
  if (!result.success) {
    return { message: PAYMENT_DECLINE_MESSAGES[result.reason], values: submittedValues };
  }

  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { companyId: session.companyId },
      create: { companyId: session.companyId, plan: plan.id, status: "ACTIVE", nextBillingDate },
      update: { plan: plan.id, status: "ACTIVE", nextBillingDate, canceledAt: null },
    }),
    prisma.paymentMethod.upsert({
      where: { companyId: session.companyId },
      create: {
        companyId: session.companyId,
        brand: result.brand,
        last4: result.last4,
        expiryMonth: data.expiryMonth,
        expiryYear: data.expiryYear,
      },
      update: { brand: result.brand, last4: result.last4, expiryMonth: data.expiryMonth, expiryYear: data.expiryYear },
    }),
    prisma.billingProfile.upsert({
      where: { companyId: session.companyId },
      create: {
        companyId: session.companyId,
        fullName: data.fullName,
        country: data.country,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        taxId: data.taxId || null,
        billingEmail: data.billingEmail,
      },
      update: {
        fullName: data.fullName,
        country: data.country,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        taxId: data.taxId || null,
        billingEmail: data.billingEmail,
      },
    }),
    prisma.invoice.create({
      data: { companyId: session.companyId, plan: plan.id, amount: plan.price, status: "PAID" },
    }),
  ]);

  revalidatePath("/billing");
  redirect(`/billing/success?plan=${plan.id}`);
}

export async function cancelSubscription(): Promise<void> {
  const session = await verifySession();

  await prisma.subscription.update({
    where: { companyId: session.companyId },
    data: { status: "CANCELED", canceledAt: new Date() },
  });

  revalidatePath("/billing");
}
