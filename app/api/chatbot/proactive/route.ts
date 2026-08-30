import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyId = typeof body?.companyId === "string" ? body.companyId : null;
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : null;
    const greeting =
      typeof body?.greeting === "string" && body.greeting.trim() ? body.greeting.trim() : "Hello! How can I help you today?";
    const followUp =
      typeof body?.followUp === "string" && body.followUp.trim()
        ? body.followUp.trim()
        : "Are you looking for a specific product or service?";

    if (!companyId || !visitorId) {
      return NextResponse.json({ error: "Missing companyId or visitorId." }, { status: 400 });
    }

    const chatbot = await prisma.chatbot.findUnique({ where: { companyId } });
    if (!chatbot?.enabled) {
      return NextResponse.json({ skipped: true });
    }

    
    const existing = await prisma.conversation.findFirst({ where: { companyId, visitorId } });
    if (existing) {
      return NextResponse.json({ skipped: true });
    }

    const conversation = await prisma.conversation.create({ data: { companyId, visitorId } });
    await prisma.message.createMany({
      data: [
        { conversationId: conversation.id, role: "assistant", content: greeting },
        { conversationId: conversation.id, role: "assistant", content: followUp },
      ],
    });

    return NextResponse.json({
      conversationId: conversation.id,
      messages: [
        { role: "assistant", content: greeting },
        { role: "assistant", content: followUp },
      ],
    });
  } catch {
    return NextResponse.json({ skipped: true });
  }
}
