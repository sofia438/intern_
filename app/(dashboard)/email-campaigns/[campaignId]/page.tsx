import { notFound } from "next/navigation";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import LeadFinderResultsPoll from "@/components/dashboard/LeadFinderResultsPoll";
import { startCampaign } from "@/app/actions/campaigns";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const CAMPAIGN_STATUS_TONE = {
  DRAFT: "soft",
  SENDING: "soft",
  COMPLETED: "acid",
  FAILED: "danger",
} as const;

function recipientStatusMeta(t: Dictionary): Record<string, { label: string; tone: "soft" | "acid" | "danger" | "dark" }> {
  return {
    PENDING: { label: t.common.status.recipient.PENDING, tone: "soft" },
    SENDING: { label: t.common.status.recipient.SENDING, tone: "soft" },
    SENT: { label: t.common.status.recipient.SENT, tone: "acid" },
    FAILED: { label: t.common.status.recipient.FAILED, tone: "danger" },
    UNSUBSCRIBED: { label: t.common.status.recipient.UNSUBSCRIBED, tone: "dark" },
  };
}

export default async function Page({ params }: { params: Promise<{ campaignId: string }> }) {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);
  const RECIPIENT_STATUS = recipientStatusMeta(t);
  const { campaignId } = await params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: { recipients: { orderBy: { createdAt: "asc" } }, searchJob: true },
  });

  if (!campaign || campaign.companyId !== session.companyId) {
    notFound();
  }

  const isSending = campaign.status === "SENDING";
  const sentCount = campaign.recipients.filter((r) => r.status === "SENT").length;
  const failedCount = campaign.recipients.filter((r) => r.status === "FAILED").length;

  return (
    <main className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight">{campaign.subject}</h1>
          <p className="mt-2 text-xl text-neutral-600">
            {campaign.searchJob.productName} · {t.campaignDetailPage.recipientsCount.replace("{count}", String(campaign.recipients.length))}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Pill tone={CAMPAIGN_STATUS_TONE[campaign.status]}>{t.common.status.campaign[campaign.status]}</Pill>
          {campaign.status === "DRAFT" && (
            <form action={startCampaign}>
              <input type="hidden" name="campaignId" value={campaign.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-[#222]"
              >
                {t.campaignDetailPage.startSending}
              </button>
            </form>
          )}
          {campaign.status !== "DRAFT" && (
            <a href={`/api/campaigns/${campaign.id}/export`}>
              <span className="inline-flex items-center gap-2 rounded bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-[#222]">
                {t.campaignDetailPage.exportReport}
              </span>
            </a>
          )}
        </div>
      </div>

      {campaign.status === "FAILED" && campaign.errorMessage && (
        <Card className="mb-8">
          <p className="text-red-600">{t.campaignDetailPage.campaignFailed.replace("{error}", campaign.errorMessage)}</p>
        </Card>
      )}

      {isSending && (
        <Card className="mb-8">
          <p>
            {t.campaignDetailPage.sendingProgress
              .replace("{sent}", String(sentCount))
              .replace("{failed}", String(failedCount))
              .replace("{remaining}", String(campaign.recipients.length - sentCount - failedCount))}
          </p>
        </Card>
      )}

      {isSending && <LeadFinderResultsPoll />}

      <Card title={t.campaignDetailPage.recipientsTitle}>
        <div className="overflow-hidden rounded border border-[#dfe2e7]">
          <table className="w-full text-left">
            <thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600">
              <tr>
                <th className="p-4">{t.campaignDetailPage.tableCompany}</th>
                <th className="p-4">{t.campaignDetailPage.tableEmail}</th>
                <th className="p-4">{t.campaignDetailPage.tableSentTime}</th>
                <th className="p-4">{t.campaignDetailPage.tableStatus}</th>
              </tr>
            </thead>
            <tbody>
              {campaign.recipients.map((r) => {
                const status = RECIPIENT_STATUS[r.status];
                return (
                  <tr className="border-t border-[#e5e5e5]" key={r.id}>
                    <td className="p-4">
                      <strong>{r.companyName ?? t.common.unknown}</strong>
                    </td>
                    <td className="p-4">{r.email}</td>
                    <td className="p-4">
                      {r.sentAt ? new Date(r.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="p-4">
                      <Pill tone={status.tone}>{status.label}</Pill>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}
