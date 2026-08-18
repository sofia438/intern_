import { notFound } from "next/navigation";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await verifySession();

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: "asc" } }, lead: true },
  });

  if (!conversation || conversation.companyId !== session.companyId) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">Conversation</h1>
        <p className="mt-2 text-xl text-neutral-600">
          Visitor {conversation.visitorId.slice(0, 8)} · Started {conversation.startedAt.toLocaleString()}
        </p>
      </div>

      {conversation.lead && (
        <div className="mb-8">
          <Card title="Captured Lead">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <small className="block font-mono text-xs text-neutral-500">Name</small>
                {conversation.lead.name}
              </div>
              <div>
                <small className="block font-mono text-xs text-neutral-500">Email</small>
                {conversation.lead.email}
              </div>
              <div>
                <small className="block font-mono text-xs text-neutral-500">Phone</small>
                {conversation.lead.phone}
              </div>
              <div>
                <small className="block font-mono text-xs text-neutral-500">Company</small>
                {conversation.lead.companyName || "—"}
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card title="Transcript">
        <div className="flex flex-col gap-4">
          {conversation.messages.map((m) => (
            <div key={m.id} className={m.role === "visitor" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "visitor"
                    ? "ml-auto inline-block max-w-[70%] rounded-2xl rounded-br-sm bg-[#07172b] px-4 py-2 text-left text-white"
                    : "inline-block max-w-[70%] rounded-2xl rounded-bl-sm bg-neutral-100 px-4 py-2 text-neutral-800"
                }
              >
                {m.content}
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400" style={{ justifyContent: m.role === "visitor" ? "flex-end" : "flex-start" }}>
                <span>{m.createdAt.toLocaleString()}</span>
                {m.intent && m.intent !== "other" && <Pill>{m.intent.replace(/_/g, " ")}</Pill>}
                {m.qualifiedLead && <Pill tone="acid">Qualified lead</Pill>}
                {m.needsFallback && <Pill tone="danger">Fallback</Pill>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
