import ChatWidget from "@/components/chatbot/ChatWidget";
import { prisma } from "@/lib/prisma";

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const chatbot = await prisma.chatbot.findUnique({ where: { companyId } });

  if (!chatbot || !chatbot.enabled) {
    return null;
  }

  return (
    <>
      {/* This page is loaded inside a customer's iframe — no background so only the button/panel show. */}
      <style>{`html, body { background: transparent !important; }`}</style>
      <ChatWidget
        companyId={companyId}
        assistantName={chatbot.assistantName}
        greeting={chatbot.greeting}
        themeColor={chatbot.themeColor}
        quickActions={chatbot.quickActions}
      />
    </>
  );
}
