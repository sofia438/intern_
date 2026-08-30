import Link from "next/link";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

const STATUS_TONE = {
  DRAFT: "soft",
  SENDING: "soft",
  COMPLETED: "acid",
  FAILED: "danger",
} as const;

const RANGE_OPTIONS = [
  { value: "1d", days: 1 },
  { value: "7d", days: 7 },
  { value: "30d", days: 30 },
  { value: "90d", days: 90 },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

function rangeCutoff(range: RangeValue): Date {
  const option = RANGE_OPTIONS.find((r) => r.value === range)!;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - option.days);
  return cutoff;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);
  const { range: rangeParam } = await searchParams;
  const range: RangeValue = RANGE_OPTIONS.some((r) => r.value === rangeParam) ? (rangeParam as RangeValue) : "30d";

  const campaigns = await prisma.emailCampaign.findMany({
    where: { companyId: session.companyId, createdAt: { gte: rangeCutoff(range) } },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { recipients: true } }, searchJob: true },
    take: 20,
  });

  const eligibleJobs = await prisma.searchJob.findMany({
    where: { companyId: session.companyId, searchType: "WEBSITE", status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">{t.emailCampaignsPage.title}</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
          {t.emailCampaignsPage.subtitle}
        </p>
      </div>

      <Card title={t.emailCampaignsPage.startNewCampaign}>
        {eligibleJobs.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            {t.emailCampaignsPage.emptyState}
          </p>
        ) : (
          <div className="divide-y divide-[#e5e5e5] dark:divide-[#3a3a3a]">
            {eligibleJobs.map((job) => (
              <Link
                key={job.id}
                href={`/email-campaigns/new/${job.id}`}
                className="flex items-center justify-between py-4 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]"
              >
                <div>
                  <strong className="text-lg dark:text-white">{job.productName}</strong>
                  <small className="block text-neutral-500 dark:text-neutral-400">{t.emailCampaignsPage.companiesFound.replace("{count}", String(job.resultsCount))}</small>
                </div>
                <span className="font-bold dark:text-white">{t.emailCampaignsPage.buildCampaign}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl font-black dark:text-white">{t.emailCampaignsPage.pastCampaigns}</h2>
          <div className="inline-flex items-center gap-1 rounded-full border border-[#d5d7dd] bg-[#f4f2f2] p-1 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
            {RANGE_OPTIONS.map((option) => (
              <Link
                key={option.value}
                href={`/email-campaigns?range=${option.value}`}
                className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                  range === option.value
                    ? "bg-white text-black shadow-sm dark:bg-[#242424] dark:text-white"
                    : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                {t.common.range[option.value]}
              </Link>
            ))}
          </div>
        </div>

        <Card>
          {campaigns.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">{t.emailCampaignsPage.noCampaignsInRange.replace("{range}", t.common.range[range])}</p>
          ) : (
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#3a3a3a]">
              {campaigns.map((campaign) => (
                <Link
                  key={campaign.id}
                  href={`/email-campaigns/${campaign.id}`}
                  className="flex items-center justify-between py-4 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]"
                >
                  <div>
                    <strong className="text-lg dark:text-white">{campaign.subject}</strong>
                    <small className="block text-neutral-500 dark:text-neutral-400">{campaign.searchJob.productName}</small>
                  </div>
                  <div className="flex items-center gap-4">
                    <Pill tone={STATUS_TONE[campaign.status]}>{t.common.status.campaign[campaign.status]}</Pill>
                    <span className="dark:text-neutral-200">{t.emailCampaignsPage.recipientsCount.replace("{count}", String(campaign._count.recipients))}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
