import Link from "next/link";

import { Card } from "@/components/dashboard/DashboardScreens";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page() {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);

  const leads = await prisma.lead.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">{t.chatbotLeadsPage.title}</h1>
        <p className="mt-2 text-xl text-neutral-600">{t.chatbotLeadsPage.subtitle}</p>
      </div>

      <Card>
        {leads.length === 0 ? (
          <p className="text-neutral-500">{t.chatbotLeadsPage.emptyState}</p>
        ) : (
          <div className="overflow-hidden rounded border border-[#dfe2e7]">
            <table className="w-full text-left">
              <thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600">
                <tr>
                  <th className="p-4">{t.chatbotLeadsPage.tableName}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tableEmail}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tablePhone}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tableCompany}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tableInterest}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tableQuantity}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tableCountry}</th>
                  <th className="p-4">{t.chatbotLeadsPage.tableDate}</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-[#e5e5e5]">
                    <td className="p-4"><strong>{lead.name}</strong></td>
                    <td className="p-4">{lead.email}</td>
                    <td className="p-4">{lead.phone}</td>
                    <td className="p-4">{lead.companyName || "—"}</td>
                    <td className="p-4">{lead.productInterest || "—"}</td>
                    <td className="p-4">{lead.quantity || "—"}</td>
                    <td className="p-4">{lead.country || "—"}</td>
                    <td className="p-4">{lead.createdAt.toLocaleDateString()}</td>
                    <td className="p-4">
                      <Link href={`/settings/chatbot/conversations/${lead.conversationId}`} className="font-bold">
                        {t.chatbotLeadsPage.viewChat}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}
