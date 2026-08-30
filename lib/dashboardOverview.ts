import "server-only";

import { prisma } from "@/lib/prisma";

export type DashboardOverviewStats = {
  totalLeadsFound: { value: number; deltaPct: number | null };
  newLeadsToday: number;
  emailsSent: { value: number; deliverabilityPct: number | null };
  countriesReached: { value: number; activeLast30Days: number };
  activeCampaigns: { value: number; completedLast30Days: number };
};

export type RecentActivityRow = {
  id: string;
  company: string;
  subtitle: string | null;
  country: string;
  source: "Website Search" | "Maps Search";
  status: "Contacted" | "New Lead";
};

const RECENT_ACTIVITY_LIMIT = 8;

export async function getRecentActivity(companyId: string): Promise<RecentActivityRow[]> {
  const results = await prisma.searchResult.findMany({
    where: { searchJob: { companyId } },
    orderBy: { createdAt: "desc" },
    take: RECENT_ACTIVITY_LIMIT,
    select: {
      id: true,
      companyName: true,
      country: true,
      category: true,
      searchJob: { select: { searchType: true, productName: true } },
      emailRecipients: { select: { id: true }, take: 1 },
    },
  });

  return results.map((r) => ({
    id: r.id,
    company: r.companyName ?? "Unknown company",
    subtitle: r.category ?? r.searchJob.productName,
    country: r.country ?? "—",
    source: r.searchJob.searchType === "MAPS" ? "Maps Search" : "Website Search",
    status: r.emailRecipients.length > 0 ? "Contacted" : "New Lead",
  }));
}

function deltaPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? null : 0;
  return ((current - previous) / previous) * 100;
}

export async function getDashboardOverviewStats(companyId: string): Promise<DashboardOverviewStats> {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalLeadsAllTime,
    leadsLast30,
    leadsPrev30,
    newLeadsToday,
    emailsSentAllTime,
    emailsFailedAllTime,
    countriesAllTimeRows,
    countriesLast30Rows,
    activeCampaignsCount,
    completedCampaignsLast30,
  ] = await Promise.all([
    prisma.searchResult.count({ where: { searchJob: { companyId } } }),
    prisma.searchResult.count({ where: { searchJob: { companyId }, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.searchResult.count({ where: { searchJob: { companyId }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.searchResult.count({ where: { searchJob: { companyId }, createdAt: { gte: startOfToday } } }),
    prisma.emailRecipient.count({ where: { status: "SENT", campaign: { companyId } } }),
    prisma.emailRecipient.count({ where: { status: "FAILED", campaign: { companyId } } }),
    prisma.searchResult.findMany({
      where: { searchJob: { companyId }, country: { not: null } },
      select: { country: true },
      distinct: ["country"],
    }),
    prisma.searchResult.findMany({
      where: { searchJob: { companyId }, country: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      select: { country: true },
      distinct: ["country"],
    }),
    prisma.emailCampaign.count({ where: { companyId, status: "SENDING" } }),
    prisma.emailCampaign.count({ where: { companyId, status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } } }),
  ]);

  const countriesAllTime = new Set(countriesAllTimeRows.map((r) => r.country)).size;
  const countriesLast30 = new Set(countriesLast30Rows.map((r) => r.country)).size;
  const totalDelivered = emailsSentAllTime + emailsFailedAllTime;

  return {
    totalLeadsFound: { value: totalLeadsAllTime, deltaPct: deltaPct(leadsLast30, leadsPrev30) },
    newLeadsToday,
    emailsSent: {
      value: emailsSentAllTime,
      deliverabilityPct: totalDelivered > 0 ? (emailsSentAllTime / totalDelivered) * 100 : null,
    },
    countriesReached: { value: countriesAllTime, activeLast30Days: countriesLast30 },
    activeCampaigns: { value: activeCampaignsCount, completedLast30Days: completedCampaignsLast30 },
  };
}
