import { NextResponse } from "next/server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/billing/plans";

export async function GET(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const { invoiceId } = await params;
  const session = await verifySession();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { company: { include: { billingProfile: true } } },
  });

  if (!invoice || invoice.companyId !== session.companyId) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  const planName = PLANS.find((p) => p.id === invoice.plan)?.name ?? invoice.plan;
  const profile = invoice.company.billingProfile;

  const lines = [
    "GLOBALEXPO — INVOICE",
    "=====================",
    "",
    `Invoice ID: ${invoice.id}`,
    `Billing Date: ${invoice.billingDate.toDateString()}`,
    `Status: ${invoice.status}`,
    "",
    `Billed to: ${profile?.fullName ?? invoice.company.name}`,
    profile ? `${profile.address}, ${profile.city}, ${profile.postalCode}` : "",
    profile ? `Country: ${profile.country}` : "",
    profile?.taxId ? `Tax/VAT: ${profile.taxId}` : "",
    profile ? `Billing email: ${profile.billingEmail}` : "",
    "",
    "---------------------",
    `Plan: ${planName}`,
    `Amount: $${invoice.amount.toFixed(2)}`,
    "---------------------",
    `Total: $${invoice.amount.toFixed(2)}`,
    "",
    "Thank you for your business.",
  ];

  return new NextResponse(lines.filter((l) => l !== "").join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoice-${invoice.id}.txt"`,
    },
  });
}
