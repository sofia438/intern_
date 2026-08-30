import Link from "next/link";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page() {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);

  const conversations = await prisma.conversation.findMany({
    where: { companyId: session.companyId },
    orderBy: { lastActiveAt: "desc" },
    include: { _count: { select: { messages: true } }, lead: { select: { id: true } } },
    take: 50,
  });

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">{t.chatbotConversationsPage.title}</h1>
        <p className="mt-2 text-xl text-neutral-600">{t.chatbotConversationsPage.subtitle}</p>
      </div>

      <Card>
        {conversations.length === 0 ? (
          <p className="text-neutral-500">{t.chatbotConversationsPage.emptyState}</p>
        ) : (
          <div className="divide-y divide-[#e5e5e5]">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/settings/chatbot/conversations/${c.id}`}
                className="flex items-center justify-between py-4 hover:bg-neutral-50"
              >
                <div>
                  <strong className="text-lg">{t.chatbotConversationsPage.visitorLabel.replace("{id}", c.visitorId.slice(0, 8))}</strong>
                  <small className="block text-neutral-500">
                    {t.chatbotConversationsPage.startedLastActive.replace("{started}", c.startedAt.toLocaleString()).replace("{lastActive}", c.lastActiveAt.toLocaleString())}
                  </small>
                </div>
                <div className="flex items-center gap-4">
                  {c.lead && <Pill tone="acid">{t.chatbotConversationsPage.leadCaptured}</Pill>}
                  <span>{t.chatbotConversationsPage.messagesCount.replace("{count}", String(c._count.messages))}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
