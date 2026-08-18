import Link from "next/link";

import { Card } from "@/components/dashboard/DashboardScreens";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await verifySession();

  const leads = await prisma.lead.findMany({
    where: { companyId: session.companyId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">Chatbot Leads</h1>
        <p className="mt-2 text-xl text-neutral-600">Contacts collected by the AI chatbot from qualified conversations.</p>
      </div>

      <Card>
        {leads.length === 0 ? (
          <p className="text-neutral-500">No leads yet. Leads appear here once a visitor submits their contact details in the chatbot.</p>
        ) : (
          <div className="overflow-hidden rounded border border-[#dfe2e7]">
            <table className="w-full text-left">
              <thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Interest</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Date</th>
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
                        View chat →
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
