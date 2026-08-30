import "server-only";

import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/billing/plans";
import { getGeographicDistribution } from "@/lib/visitorIntelligence";
import type { GeoDistribution } from "@/lib/visitorIntelligenceShared";
import { REPORTS_RANGE_OPTIONS, type ReportsRange, type ReportsFilters } from "@/lib/reportsShared";

export { REPORTS_RANGE_OPTIONS, isReportsRange } from "@/lib/reportsShared";
export type { ReportsRange, ReportsFilters } from "@/lib/reportsShared";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function rangeBounds(range: ReportsRange): { from: Date | null; to: Date; prevFrom: Date | null; prevTo: Date | null } {
  const now = new Date();
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  switch (range) {
    case "today": {
      const prevFrom = new Date(startToday);
      prevFrom.setDate(prevFrom.getDate() - 1);
      return { from: startToday, to: now, prevFrom, prevTo: startToday };
    }
    case "7d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 7);
      const prevFrom = new Date(now);
      prevFrom.setDate(prevFrom.getDate() - 14);
      return { from, to: now, prevFrom, prevTo: from };
    }
    case "90d": {
      const from = new Date(now);
      from.setDate(from.getDate() - 90);
      const prevFrom = new Date(now);
      prevFrom.setDate(prevFrom.getDate() - 180);
      return { from, to: now, prevFrom, prevTo: from };
    }
    case "this_month": {
      const from = startOfMonth(now);
      const prevFrom = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      return { from, to: now, prevFrom, prevTo: from };
    }
    case "last_month": {
      const from = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const to = startOfMonth(now);
      const prevFrom = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1));
      return { from, to, prevFrom, prevTo: from };
    }
    case "all":
      return { from: null, to: now, prevFrom: null, prevTo: null };
    case "30d":
    default: {
      const from = new Date(now);
      from.setDate(from.getDate() - 30);
      const prevFrom = new Date(now);
      prevFrom.setDate(prevFrom.getDate() - 60);
      return { from, to: now, prevFrom, prevTo: from };
    }
  }
}

function deltaPct(current: number, previous: number | null): number | null {
  if (previous === null) return null;
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

function bucketByDay(dates: Date[], from: Date, to: Date): { label: string; value: number }[] {
  const cappedFrom = new Date(Math.max(from.getTime(), to.getTime() - 366 * 24 * 60 * 60 * 1000));
  const cursor = new Date(cappedFrom);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  const days: { key: string; label: string; value: number }[] = [];
  while (cursor <= end) {
    days.push({
      key: cursor.toISOString().slice(0, 10),
      label: cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const date of dates) {
    const bucket = byKey.get(date.toISOString().slice(0, 10));
    if (bucket) bucket.value++;
  }
  return days.map(({ label, value }) => ({ label, value }));
}

export type ReportsData = {
  range: ReportsRange;
  rangeLabel: string;

  kpis: {
    totalLeads: { value: number; deltaPct: number | null };
    websiteVisitors: { value: number; deltaPct: number | null };
    identifiedCompanies: { value: number; deltaPct: number | null };
    countriesReached: { value: number; deltaPct: number | null };
    emailsSent: { value: number; deltaPct: number | null };
    activeCampaigns: { value: number; deltaPct: number | null };
  };

  leadPerformance: {
    trend: { label: string; value: number }[];
    byCountry: { label: string; value: number }[];
    bySearchType: { label: string; value: number; color: string }[];
  };

  visitorIntelligence: {
    trend: { label: string; value: number }[];
    geo: GeoDistribution;
    returnVisitors: { total: number; newCount: number; percentage: number };
  };

  emailPerformance: {
    statusBreakdown: { label: string; value: number; color: string }[];
    campaignPerformance: { label: string; values: Record<string, number> }[];
    trend: { label: string; value: number }[];
  };

  chatbot: {
    conversations: number;
    qualifiedLeads: number;
    fallbackRate: number;
    conversionRate: number;
  };

  leadFinder: {
    totalSearches: number;
    websiteSearches: number;
    mapsSearches: number;
    completedSearches: number;
    failedSearches: number;
    totalResults: number;
    avgResultsPerSearch: number;
    trend: { label: string; value: number }[];
    resultsByType: { label: string; value: number }[];
    products: string[];
  };

  usage: {
    planId: PlanId | null;
    planName: string | null;
    searches: { used: number; limit: number };
    leads: { used: number; limit: number };
    emails: { used: number; limit: number };
    chatbotConversations: { used: number; limit: number };
  };

  performanceScore: number;

  filterOptions: {
    countries: string[];
    campaigns: { id: string; label: string }[];
    products: string[];
  };
};

export async function getReportsData(companyId: string, filters: ReportsFilters): Promise<ReportsData> {
  const { from, to, prevFrom, prevTo } = rangeBounds(filters.range);
  const dateWhere = from ? { gte: from, lte: to } : { lte: to };
  const prevDateWhere = prevFrom && prevTo ? { gte: prevFrom, lt: prevTo } : null;
  const trendFrom = from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const leadCountryFilter = filters.country ? { country: filters.country } : {};
  const visitorCountryFilter = filters.country ? { country: filters.country } : {};
  const resultCountryFilter = filters.country ? { country: filters.country } : {};
  const searchJobTypeFilter = filters.searchType ? { searchType: filters.searchType } : {};
  const searchJobProductFilter = filters.product ? { productName: filters.product } : {};

  const [
    leadsInRange,
    leadsPrev,
    leadRows,
    visitorsInRange,
    visitorsPrev,
    visitorRows,
    identifiedInRange,
    identifiedPrev,
    countriesInRange,
    countriesPrev,
    emailsSentInRange,
    emailsSentPrev,
    activeCampaignsCount,
    activeCampaignsPrev,
    searchJobs,
    searchResultsCount,
    conversationsCount,
    qualifiedLeadsCount,
    fallbackMessagesCount,
    visitorMessagesCount,
    campaigns,
    campaignRecipients,
    emailStatusRows,
    subscription,
    allCountries,
    allCampaigns,
    allProducts,
  ] = await Promise.all([
    prisma.lead.count({ where: { companyId, createdAt: dateWhere, ...leadCountryFilter } }),
    prevDateWhere ? prisma.lead.count({ where: { companyId, createdAt: prevDateWhere, ...leadCountryFilter } }) : Promise.resolve(null),
    prisma.lead.findMany({ where: { companyId, createdAt: { gte: trendFrom, lte: to }, ...leadCountryFilter }, select: { createdAt: true, country: true } }),
    prisma.websiteVisitor.count({ where: { companyId, lastVisit: dateWhere, ...visitorCountryFilter } }),
    prevDateWhere ? prisma.websiteVisitor.count({ where: { companyId, lastVisit: prevDateWhere, ...visitorCountryFilter } }) : Promise.resolve(null),
    prisma.websiteVisitor.findMany({ where: { companyId, lastVisit: { gte: trendFrom, lte: to }, ...visitorCountryFilter }, select: { lastVisit: true, visitCount: true } }),
    prisma.websiteVisitor.findMany({ where: { companyId, lastVisit: dateWhere, organization: { not: null }, ...visitorCountryFilter }, select: { organization: true } }),
    prevDateWhere ? prisma.websiteVisitor.findMany({ where: { companyId, lastVisit: prevDateWhere, organization: { not: null }, ...visitorCountryFilter }, select: { organization: true } }) : Promise.resolve(null),
    prisma.searchResult.findMany({ where: { searchJob: { companyId, createdAt: dateWhere, ...searchJobTypeFilter, ...searchJobProductFilter }, country: { not: null }, ...resultCountryFilter }, select: { country: true } }),
    prevDateWhere ? prisma.searchResult.findMany({ where: { searchJob: { companyId, createdAt: prevDateWhere, ...searchJobTypeFilter, ...searchJobProductFilter }, country: { not: null }, ...resultCountryFilter }, select: { country: true } }) : Promise.resolve(null),
    prisma.emailRecipient.count({ where: { status: "SENT", sentAt: dateWhere, campaign: { companyId, ...(filters.campaignId ? { id: filters.campaignId } : {}) } } }),
    prevDateWhere ? prisma.emailRecipient.count({ where: { status: "SENT", sentAt: prevDateWhere, campaign: { companyId, ...(filters.campaignId ? { id: filters.campaignId } : {}) } } }) : Promise.resolve(null),
    prisma.emailCampaign.count({ where: { companyId, status: "SENDING", ...(filters.campaignId ? { id: filters.campaignId } : {}) } }),
    prevDateWhere ? prisma.emailCampaign.count({ where: { companyId, status: "SENDING", createdAt: prevDateWhere, ...(filters.campaignId ? { id: filters.campaignId } : {}) } }) : Promise.resolve(null),
    prisma.searchJob.findMany({ where: { companyId, createdAt: dateWhere, ...searchJobTypeFilter, ...searchJobProductFilter }, select: { id: true, searchType: true, status: true, resultsCount: true, createdAt: true, productName: true } }),
    prisma.searchResult.count({ where: { searchJob: { companyId, createdAt: dateWhere, ...searchJobTypeFilter, ...searchJobProductFilter }, ...resultCountryFilter } }),
    prisma.conversation.count({ where: { companyId, startedAt: dateWhere } }),
    prisma.lead.count({ where: { companyId, createdAt: dateWhere } }),
    prisma.message.count({ where: { needsFallback: true, conversation: { companyId, startedAt: dateWhere } } }),
    prisma.message.count({ where: { role: "visitor", conversation: { companyId, startedAt: dateWhere } } }),
    prisma.emailCampaign.findMany({ where: { companyId, createdAt: dateWhere, ...(filters.campaignId ? { id: filters.campaignId } : {}) }, select: { id: true, subject: true, _count: { select: { recipients: true } } } }),
    prisma.emailRecipient.groupBy({ by: ["campaignId", "status"], where: { campaign: { companyId, createdAt: dateWhere, ...(filters.campaignId ? { id: filters.campaignId } : {}) } }, _count: true }),
    prisma.emailRecipient.groupBy({ by: ["status"], where: { createdAt: dateWhere, campaign: { companyId, ...(filters.campaignId ? { id: filters.campaignId } : {}) } }, _count: true }),
    prisma.subscription.findUnique({ where: { companyId } }),
    prisma.lead.findMany({ where: { companyId, country: { not: null } }, select: { country: true }, distinct: ["country"] }),
    prisma.emailCampaign.findMany({ where: { companyId }, select: { id: true, subject: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.searchJob.findMany({ where: { companyId }, select: { productName: true }, distinct: ["productName"] }),
  ]);

  // --- KPIs ---
  const totalLeads = { value: leadsInRange, deltaPct: deltaPct(leadsInRange, leadsPrev) };

  const websiteVisitors = { value: visitorsInRange, deltaPct: deltaPct(visitorsInRange, visitorsPrev) };

  const identifiedInRangeCount = new Set(identifiedInRange.map((v) => v.organization)).size;
  const identifiedPrevCount = identifiedPrev ? new Set(identifiedPrev.map((v) => v.organization)).size : null;
  const identifiedCompanies = { value: identifiedInRangeCount, deltaPct: deltaPct(identifiedInRangeCount, identifiedPrevCount) };

  const countriesInRangeCount = new Set(countriesInRange.map((v) => v.country)).size;
  const countriesPrevCount = countriesPrev ? new Set(countriesPrev.map((v) => v.country)).size : null;
  const countriesReached = { value: countriesInRangeCount, deltaPct: deltaPct(countriesInRangeCount, countriesPrevCount) };

  const emailsSent = { value: emailsSentInRange, deltaPct: deltaPct(emailsSentInRange, emailsSentPrev) };
  const activeCampaigns = { value: activeCampaignsCount, deltaPct: deltaPct(activeCampaignsCount, activeCampaignsPrev) };

  
  const leadTrend = bucketByDay(leadRows.map((l) => l.createdAt), trendFrom, to);

  const leadCountryCounts = new Map<string, number>();
  for (const l of leadRows) {
    if (!l.country) continue;
    leadCountryCounts.set(l.country, (leadCountryCounts.get(l.country) ?? 0) + 1);
  }
  const leadByCountry = Array.from(leadCountryCounts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const websiteJobCount = searchJobs.filter((j) => j.searchType === "WEBSITE").length;
  const mapsJobCount = searchJobs.filter((j) => j.searchType === "MAPS").length;
  const leadBySearchType = [
    { label: "Website Search", value: websiteJobCount, color: "#4338ca" },
    { label: "Maps Search", value: mapsJobCount, color: "#60a5fa" },
  ];

  
  const visitorTrend = bucketByDay(visitorRows.map((v) => v.lastVisit), trendFrom, to);
  const returningInRange = visitorRows.filter((v) => v.visitCount > 1).length;
  const newInRange = visitorRows.length - returningInRange;
  const geo = await getGeographicDistribution(companyId, filters.range === "today" ? "24h" : filters.range === "this_month" || filters.range === "last_month" ? "30d" : (filters.range as "24h" | "7d" | "30d" | "90d" | "all"), filters.country);

  
  const statusColors: Record<string, string> = { SENT: "#16a34a", FAILED: "#dc2626", PENDING: "#d97706", SENDING: "#4338ca", UNSUBSCRIBED: "#6b7280" };
  const statusBreakdown = emailStatusRows.map((r) => ({ label: r.status, value: r._count, color: statusColors[r.status] ?? "#6b7280" }));

  const recipientsByCampaign = new Map<string, Record<string, number>>();
  for (const row of campaignRecipients) {
    const existing = recipientsByCampaign.get(row.campaignId) ?? {};
    existing[row.status] = row._count;
    recipientsByCampaign.set(row.campaignId, existing);
  }
  const campaignPerformance = campaigns.map((c) => ({
    label: c.subject.length > 28 ? `${c.subject.slice(0, 28)}…` : c.subject,
    values: {
      recipients: c._count.recipients,
      sent: recipientsByCampaign.get(c.id)?.SENT ?? 0,
      failed: recipientsByCampaign.get(c.id)?.FAILED ?? 0,
      unsubscribed: recipientsByCampaign.get(c.id)?.UNSUBSCRIBED ?? 0,
    },
  }));

  const sentDatesRows = await prisma.emailRecipient.findMany({
    where: { status: "SENT", sentAt: { gte: trendFrom, lte: to, not: null }, campaign: { companyId, ...(filters.campaignId ? { id: filters.campaignId } : {}) } },
    select: { sentAt: true },
  });
  const emailTrend = bucketByDay(sentDatesRows.map((r) => r.sentAt!), trendFrom, to);

  
  const fallbackRate = visitorMessagesCount > 0 ? (fallbackMessagesCount / visitorMessagesCount) * 100 : 0;
  const conversionRate = conversationsCount > 0 ? (qualifiedLeadsCount / conversationsCount) * 100 : 0;

  
  const completedSearches = searchJobs.filter((j) => j.status === "COMPLETED").length;
  const failedSearches = searchJobs.filter((j) => j.status === "FAILED").length;
  const totalResultsFromJobs = searchJobs.reduce((sum, j) => sum + j.resultsCount, 0);
  const searchTrend = bucketByDay(searchJobs.map((j) => j.createdAt), trendFrom, to);
  const resultsByType = [
    { label: "Website Search", value: searchJobs.filter((j) => j.searchType === "WEBSITE").reduce((s, j) => s + j.resultsCount, 0) },
    { label: "Maps Search", value: searchJobs.filter((j) => j.searchType === "MAPS").reduce((s, j) => s + j.resultsCount, 0) },
  ];

  
  const monthStart = startOfMonth(new Date());
  const [searchesThisMonth, leadsThisMonth, emailsThisMonth, chatbotThisMonth] = await Promise.all([
    prisma.searchJob.count({ where: { companyId, createdAt: { gte: monthStart } } }),
    prisma.lead.count({ where: { companyId, createdAt: { gte: monthStart } } }),
    prisma.emailRecipient.count({ where: { status: "SENT", sentAt: { gte: monthStart }, campaign: { companyId } } }),
    prisma.conversation.count({ where: { companyId, startedAt: { gte: monthStart } } }),
  ]);

  const plan = subscription && subscription.status === "ACTIVE" ? PLANS.find((p) => p.id === subscription.plan) : undefined;
  const limits = plan?.limits ?? { searches: 0, leads: 0, emails: 0, chatbotConversations: 0 };

  
  const rates: number[] = [];
  if (searchJobs.length > 0) rates.push((completedSearches / searchJobs.length) * 100);
  const totalRecipientsInRange = campaigns.reduce((s, c) => s + c._count.recipients, 0);
  if (totalRecipientsInRange > 0) rates.push((emailsSentInRange / totalRecipientsInRange) * 100);
  if (conversationsCount > 0) rates.push(conversionRate);
  if (visitorRows.length > 0) rates.push((returningInRange / visitorRows.length) * 100);
  const performanceScore = rates.length > 0 ? Math.round(rates.reduce((s, r) => s + r, 0) / rates.length) : 0;

  return {
    range: filters.range,
    rangeLabel: REPORTS_RANGE_OPTIONS.find((r) => r.value === filters.range)?.label ?? "Last 30 Days",
    kpis: { totalLeads, websiteVisitors, identifiedCompanies, countriesReached, emailsSent, activeCampaigns },
    leadPerformance: { trend: leadTrend, byCountry: leadByCountry, bySearchType: leadBySearchType },
    visitorIntelligence: {
      trend: visitorTrend,
      geo,
      returnVisitors: { total: returningInRange, newCount: newInRange, percentage: visitorRows.length > 0 ? (returningInRange / visitorRows.length) * 100 : 0 },
    },
    emailPerformance: { statusBreakdown, campaignPerformance, trend: emailTrend },
    chatbot: { conversations: conversationsCount, qualifiedLeads: qualifiedLeadsCount, fallbackRate, conversionRate },
    leadFinder: {
      totalSearches: searchJobs.length,
      websiteSearches: websiteJobCount,
      mapsSearches: mapsJobCount,
      completedSearches,
      failedSearches,
      totalResults: totalResultsFromJobs || searchResultsCount,
      avgResultsPerSearch: searchJobs.length > 0 ? totalResultsFromJobs / searchJobs.length : 0,
      trend: searchTrend,
      resultsByType,
      products: allProducts.map((p) => p.productName),
    },
    usage: {
      planId: plan?.id ?? null,
      planName: plan?.name ?? null,
      searches: { used: searchesThisMonth, limit: limits.searches },
      leads: { used: leadsThisMonth, limit: limits.leads },
      emails: { used: emailsThisMonth, limit: limits.emails },
      chatbotConversations: { used: chatbotThisMonth, limit: limits.chatbotConversations },
    },
    performanceScore,
    filterOptions: {
      countries: allCountries.map((c) => c.country!).filter(Boolean).sort(),
      campaigns: allCampaigns.map((c) => ({ id: c.id, label: c.subject })),
      products: allProducts.map((p) => p.productName).filter(Boolean).sort(),
    },
  };
}
