import { NextResponse } from "next/server";

import { generateChatReply, FALLBACK_REPLY, type ChatHistoryItem } from "@/lib/chatbot/ai";
import { prisma } from "@/lib/prisma";

const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyId = typeof body?.companyId === "string" ? body.companyId : null;
    const visitorId = typeof body?.visitorId === "string" ? body.visitorId : null;
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : "";
    const requestedConversationId = typeof body?.conversationId === "string" ? body.conversationId : null;

    if (!companyId || !visitorId || !message) {
      return NextResponse.json({ error: "Missing companyId, visitorId, or message." }, { status: 400 });
    }

    const chatbot = await prisma.chatbot.findUnique({ where: { companyId } });
    if (!chatbot?.enabled) {
      return NextResponse.json({ error: "This chatbot is not available." }, { status: 404 });
    }

    // Only reuse the client-supplied conversationId if it really belongs to this visitor/company —
    // otherwise a visitor could read another company's conversation just by guessing an id.
    let conversation = requestedConversationId
      ? await prisma.conversation.findUnique({ where: { id: requestedConversationId } })
      : null;

    if (!conversation || conversation.companyId !== companyId || conversation.visitorId !== visitorId) {
      conversation = await prisma.conversation.create({ data: { companyId, visitorId } });
    }

    const visitorMessage = await prisma.message.create({
      data: { conversationId: conversation.id, role: "visitor", content: message },
    });

    const recentMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "desc" },
      take: MAX_HISTORY_MESSAGES,
    });
    const history: ChatHistoryItem[] = recentMessages
      .reverse()
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "visitor", content: m.content }));

    const existingLead = await prisma.lead.findUnique({ where: { conversationId: conversation.id } });
    const languageSettings = chatbot
      ? { mode: chatbot.languageMode, supportedLanguages: chatbot.supportedLanguages }
      : undefined;
    const { reply, intent, qualifiedLead, needsFallback } = await generateChatReply(
      history,
      chatbot?.knowledge,
      !!existingLead,
      languageSettings
    );

    await prisma.message.update({ where: { id: visitorMessage.id }, data: { intent, qualifiedLead, needsFallback } });
    await prisma.message.create({ data: { conversationId: conversation.id, role: "assistant", content: reply } });
    await prisma.conversation.update({ where: { id: conversation.id }, data: { lastActiveAt: new Date() } });

    return NextResponse.json({ conversationId: conversation.id, reply, intent, qualifiedLead, needsFallback });
  } catch {
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
