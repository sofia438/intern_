import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const visitorId = searchParams.get("visitorId");

    if (!companyId || !visitorId) {
      return NextResponse.json({ conversationId: null, messages: [] });
    }

    const conversation = await prisma.conversation.findFirst({
      where: { companyId, visitorId },
      orderBy: { lastActiveAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!conversation) {
      return NextResponse.json({ conversationId: null, messages: [] });
    }

    return NextResponse.json({
      conversationId: conversation.id,
      messages: conversation.messages.map((m) => ({ role: m.role, content: m.content })),
    });
  } catch {
    return NextResponse.json({ conversationId: null, messages: [] });
  }
}
