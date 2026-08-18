import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

function htmlResponse(message: string) {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>Unsubscribe</title></head><body style="font-family: sans-serif; max-width: 480px; margin: 80px auto; text-align: center;"><p>${message}</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return htmlResponse("Invalid unsubscribe link.");
  }

  const recipient = await prisma.emailRecipient.findUnique({
    where: { unsubscribeToken: token },
    include: { campaign: true },
  });

  if (!recipient) {
    return htmlResponse("Invalid unsubscribe link.");
  }

  await prisma.emailRecipient.update({
    where: { id: recipient.id },
    data: { status: "UNSUBSCRIBED" },
  });

  await prisma.emailSuppression.upsert({
    where: {
      companyId_email: { companyId: recipient.campaign.companyId, email: recipient.email },
    },
    create: { companyId: recipient.campaign.companyId, email: recipient.email },
    update: {},
  });

  return htmlResponse("You have been unsubscribed and will not receive further emails from us.");
}
