import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const CONFIRMATION_MESSAGE = "Thank you! Our team has your details and will be in touch shortly.";

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyId = requiredString(body?.companyId);
    const conversationId = requiredString(body?.conversationId);
    const name = requiredString(body?.name);
    const email = requiredString(body?.email);
    const phone = requiredString(body?.phone);

    if (!companyId || !conversationId || !name || !email || !phone) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conversation || conversation.companyId !== companyId) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const lead = await prisma.lead.upsert({
      where: { conversationId },
      create: {
        companyId,
        conversationId,
        name,
        email,
        phone,
        companyName: optionalString(body?.companyName),
        productInterest: optionalString(body?.productInterest),
        quantity: optionalString(body?.quantity),
        country: optionalString(body?.country),
      },
      update: {},
    });

    await prisma.message.create({
      data: { conversationId, role: "assistant", content: CONFIRMATION_MESSAGE },
    });
    await prisma.conversation.update({ where: { id: conversationId }, data: { lastActiveAt: new Date() } });

    return NextResponse.json({ leadId: lead.id, confirmationMessage: CONFIRMATION_MESSAGE });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
