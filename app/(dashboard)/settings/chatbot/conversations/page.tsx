import Link from "next/link";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await verifySession();

  const conversations = await prisma.conversation.findMany({
    where: { companyId: session.companyId },
    orderBy: { lastActiveAt: "desc" },
    include: { _count: { select: { messages: true } }, lead: { select: { id: true } } },
    take: 50,
  });

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">Chatbot Conversations</h1>
        <p className="mt-2 text-xl text-neutral-600">Every conversation the AI chatbot has had with your website visitors.</p>
      </div>

      <Card>
        {conversations.length === 0 ? (
          <p className="text-neutral-500">No conversations yet. Once your chatbot is enabled and embedded, conversations will show up here.</p>
        ) : (
          <div className="divide-y divide-[#e5e5e5]">
            {conversations.map((c) => (
              <Link
                key={c.id}
                href={`/settings/chatbot/conversations/${c.id}`}
                className="flex items-center justify-between py-4 hover:bg-neutral-50"
              >
                <div>
                  <strong className="text-lg">Visitor {c.visitorId.slice(0, 8)}</strong>
                  <small className="block text-neutral-500">
                    Started {c.startedAt.toLocaleString()} · Last active {c.lastActiveAt.toLocaleString()}
                  </small>
                </div>
                <div className="flex items-center gap-4">
                  {c.lead && <Pill tone="acid">Lead captured</Pill>}
                  <span>{c._count.messages} messages</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
}
