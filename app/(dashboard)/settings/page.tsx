import Link from "next/link";

import { Card } from "@/components/dashboard/DashboardScreens";
import CopySnippetButton from "@/components/dashboard/CopySnippetButton";
import ChatbotSettingsForm from "@/components/dashboard/ChatbotSettingsForm";
import ChatbotKnowledgeForm from "@/components/dashboard/ChatbotKnowledgeForm";
import ChatbotLanguageForm from "@/components/dashboard/ChatbotLanguageForm";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await verifySession();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const snippet = `<script async src="${appUrl}/track.js" data-site="${session.companyId}"></script>`;
  const chatbotEmbedSnippet = `<script src="${appUrl}/chatbot.js"></script>\n<script>GlobalExpo.initChat({ companyId: "${session.companyId}" });</script>`;

  const chatbot = await prisma.chatbot.findUnique({ where: { companyId: session.companyId } });
  const [conversationCount, leadCount] = await Promise.all([
    prisma.conversation.count({ where: { companyId: session.companyId } }),
    prisma.lead.count({ where: { companyId: session.companyId } }),
  ]);

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">Settings</h1>
        <p className="mt-2 text-xl text-neutral-600">Manage your company&apos;s workspace configuration.</p>
      </div>

      <Card title="Website Tracking" subtitle="Embed this script on your website to identify visiting companies.">
        <pre className="overflow-x-auto rounded bg-[#07172b] p-5 text-sm text-white">
          <code>{snippet}</code>
        </pre>
        <div className="mt-5">
          <CopySnippetButton snippet={snippet} />
        </div>
      </Card>

      <div className="mt-8">
        <Card title="AI Chatbot Identity & Status" subtitle="Control whether the chatbot is live and how it presents itself to visitors.">
          <ChatbotSettingsForm
            initialEnabled={chatbot?.enabled ?? false}
            initialAssistantName={chatbot?.assistantName ?? "AI Assistant"}
            initialGreeting={chatbot?.greeting ?? "Hello! How can I help you today?"}
            initialThemeColor={chatbot?.themeColor ?? "#4f46e5"}
            initialQuickActions={
              chatbot?.quickActions ?? [
                "What products do you offer?",
                "Do you export to Germany?",
                "Can I request a quotation?",
                "How can I contact sales?",
              ]
            }
          />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="AI Chatbot Knowledge Base" subtitle="Give the chatbot information about your company so it can answer visitors accurately.">
          <ChatbotKnowledgeForm initialKnowledge={chatbot?.knowledge ?? ""} />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Chatbot Language Settings" subtitle="Control which languages the chatbot is allowed to respond in.">
          <ChatbotLanguageForm
            initialMode={chatbot?.languageMode ?? "automatic"}
            initialLanguages={chatbot?.supportedLanguages ?? []}
          />
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Embed on Your Website" subtitle="Paste this snippet before the closing </body> tag of your website to add the chatbot.">
          <pre className="overflow-x-auto rounded bg-[#07172b] p-5 text-sm text-white">
            <code>{chatbotEmbedSnippet}</code>
          </pre>
          <div className="mt-5">
            <CopySnippetButton snippet={chatbotEmbedSnippet} />
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <Card title="Chatbot Activity" subtitle="Conversations and leads collected by your AI chatbot.">
          <div className="grid grid-cols-2 gap-8">
            <Link href="/settings/chatbot/conversations" className="block rounded border border-[#dfe2e7] p-6 hover:bg-neutral-50">
              <strong className="block text-4xl font-black">{conversationCount}</strong>
              <span className="mt-2 block font-bold">Conversations →</span>
            </Link>
            <Link href="/settings/chatbot/leads" className="block rounded border border-[#dfe2e7] p-6 hover:bg-neutral-50">
              <strong className="block text-4xl font-black">{leadCount}</strong>
              <span className="mt-2 block font-bold">Leads →</span>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
