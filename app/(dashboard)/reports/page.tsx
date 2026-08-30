import { Users, UserRound, Building2, Globe2, Mail, Zap, MessageSquare, ShieldCheck, TrendingUp, Search } from "lucide-react";

import { Card, Stat, Pill, DonutChart } from "@/components/dashboard/DashboardScreens";
import { LineTrendChart, BarRows, GroupedBarChart, CircularUsageChart, KpiDelta } from "@/components/dashboard/ReportsCharts";
import GeographicDistribution from "@/components/dashboard/GeographicDistribution";
import ReportsFilterBar from "@/components/dashboard/ReportsFilterBar";
import { verifySession, getUser } from "@/lib/dal";
import { getReportsData, isReportsRange, type ReportsFilters } from "@/lib/reports";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; country?: string; searchType?: string; campaignId?: string; product?: string }>;
}) {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);
  const sp = await searchParams;

  const filters: ReportsFilters = {
    range: isReportsRange(sp.range ?? "") ? (sp.range as ReportsFilters["range"]) : "30d",
    country: sp.country || undefined,
    searchType: sp.searchType === "WEBSITE" || sp.searchType === "MAPS" ? sp.searchType : undefined,
    campaignId: sp.campaignId || undefined,
    product: sp.product || undefined,
  };

  const data = await getReportsData(session.companyId, filters);

  return (
    <main className="p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{t.reportsPage.title}</h1>
        <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400 sm:text-xl">
          {t.reportsPage.subtitle}
        </p>
      </div>

      <ReportsFilterBar filters={filters} filterOptions={data.filterOptions} />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label={t.reportsPage.totalLeads} value={data.kpis.totalLeads.value.toLocaleString()} note={<KpiDelta deltaPct={data.kpis.totalLeads.deltaPct} />} icon={<Users size={22} />} />
        <Stat label={t.reportsPage.websiteVisitors} value={data.kpis.websiteVisitors.value.toLocaleString()} note={<KpiDelta deltaPct={data.kpis.websiteVisitors.deltaPct} />} icon={<UserRound size={22} />} />
        <Stat label={t.reportsPage.identifiedCompanies} value={data.kpis.identifiedCompanies.value.toLocaleString()} note={<KpiDelta deltaPct={data.kpis.identifiedCompanies.deltaPct} />} icon={<Building2 size={22} />} />
        <Stat label={t.reportsPage.countriesReached} value={data.kpis.countriesReached.value.toLocaleString()} note={<KpiDelta deltaPct={data.kpis.countriesReached.deltaPct} />} icon={<Globe2 size={22} />} />
        <Stat label={t.reportsPage.emailsSent} value={data.kpis.emailsSent.value.toLocaleString()} note={<KpiDelta deltaPct={data.kpis.emailsSent.deltaPct} />} icon={<Mail size={22} />} />
        <Stat label={t.reportsPage.activeCampaigns} value={data.kpis.activeCampaigns.value.toLocaleString()} note={<KpiDelta deltaPct={data.kpis.activeCampaigns.deltaPct} />} icon={<Zap size={22} />} />
      </div>

      {/* Lead Performance */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.leadPerformance}</h2>
      <Card title={t.reportsPage.leadGenerationTrend}>
        <LineTrendChart data={data.leadPerformance.trend} />
      </Card>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title={t.reportsPage.leadsByCountry}>
          <BarRows data={data.leadPerformance.byCountry} />
        </Card>
        <Card title={t.reportsPage.leadsBySearchType}>
          {data.leadPerformance.bySearchType.every((s) => s.value === 0) ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.reportsPage.noSearchesForPeriod}</p>
          ) : (
            <DonutChart
              centerLabel={String(data.leadPerformance.bySearchType.reduce((s, x) => s + x.value, 0))}
              segments={data.leadPerformance.bySearchType}
            />
          )}
        </Card>
      </div>

      {/* Visitor Intelligence */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.visitorIntelligence}</h2>
      <Card title={t.reportsPage.websiteVisitorTrend}>
        <LineTrendChart data={data.visitorIntelligence.trend} color="#0ea5e9" />
      </Card>

      <Card className="mt-8">
        <GeographicDistribution initialData={data.visitorIntelligence.geo} />
      </Card>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
        <Card title={t.reportsPage.topCountries}>
          {data.visitorIntelligence.geo.countries.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.reportsPage.noVisitorLocationsYet}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead className="font-mono text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th className="py-2">{t.reportsPage.tableCountry}</th>
                    <th className="py-2 text-right">{t.reportsPage.tableVisitors}</th>
                    <th className="py-2 text-right">{t.reportsPage.tableShare}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.visitorIntelligence.geo.countries.map((c) => (
                    <tr key={c.country} className="border-t border-[#ececec] dark:border-[#3a3a3a]">
                      <td className="py-2 font-bold dark:text-neutral-100">{c.country}</td>
                      <td className="py-2 text-right dark:text-neutral-300">{c.count.toLocaleString()}</td>
                      <td className="py-2 text-right dark:text-neutral-300">{c.percentage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title={t.reportsPage.returnVisitorAnalysis}>
          {data.visitorIntelligence.trend.every((point) => point.value === 0) && data.visitorIntelligence.returnVisitors.total === 0 && data.visitorIntelligence.returnVisitors.newCount === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.reportsPage.noVisitorsForPeriod}</p>
          ) : (
            <DonutChart
              centerLabel={`${Math.round(data.visitorIntelligence.returnVisitors.percentage)}%`}
              segments={[
                { label: t.reportsPage.returning, value: data.visitorIntelligence.returnVisitors.total, color: "#4338ca" },
                { label: t.reportsPage.newLabel, value: data.visitorIntelligence.returnVisitors.newCount, color: "#c7d2fe" },
              ]}
            />
          )}
        </Card>
      </div>

      {/* Email Performance */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.emailPerformance}</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title={t.reportsPage.campaignPerformance}>
          <GroupedBarChart
            data={data.emailPerformance.campaignPerformance}
            series={[
              { key: "sent", color: "#16a34a", name: t.reportsPage.sent },
              { key: "failed", color: "#dc2626", name: t.reportsPage.failed },
              { key: "unsubscribed", color: "#6b7280", name: t.reportsPage.unsubscribed },
            ]}
          />
        </Card>
        <Card title={t.reportsPage.emailStatus}>
          {data.emailPerformance.statusBreakdown.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.reportsPage.noEmailActivityForPeriod}</p>
          ) : (
            <DonutChart
              centerLabel={String(data.emailPerformance.statusBreakdown.reduce((s, x) => s + x.value, 0))}
              segments={data.emailPerformance.statusBreakdown}
            />
          )}
        </Card>
      </div>
      <Card className="mt-8" title={t.reportsPage.emailsSentTrend}>
        <LineTrendChart data={data.emailPerformance.trend} color="#16a34a" />
      </Card>

      {/* Chatbot Performance */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.chatbotPerformance}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.reportsPage.conversations} value={data.chatbot.conversations.toLocaleString()} note={t.reportsPage.thisPeriod} icon={<MessageSquare size={22} />} />
        <Stat label={t.reportsPage.qualifiedLeads} value={data.chatbot.qualifiedLeads.toLocaleString()} note={t.reportsPage.thisPeriod} icon={<ShieldCheck size={22} />} />
        <Stat label={t.reportsPage.fallbackRate} value={`${data.chatbot.fallbackRate.toFixed(1)}%`} note={t.reportsPage.ofVisitorMessages} icon={<TrendingUp size={22} />} />
        <Stat label={t.reportsPage.conversionRate} value={`${data.chatbot.conversionRate.toFixed(1)}%`} note={t.reportsPage.qualifiedLeadsOverConversations} icon={<Zap size={22} />} />
      </div>

      {/* Search Performance */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.searchPerformance}</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.reportsPage.totalSearches} value={data.leadFinder.totalSearches.toLocaleString()} note={t.reportsPage.websiteAndMapsSearches.replace("{website}", String(data.leadFinder.websiteSearches)).replace("{maps}", String(data.leadFinder.mapsSearches))} icon={<Search size={22} />} />
        <Stat label={t.reportsPage.totalResults} value={data.leadFinder.totalResults.toLocaleString()} note={t.reportsPage.avgPerSearch.replace("{avg}", data.leadFinder.avgResultsPerSearch.toFixed(1))} icon={<Globe2 size={22} />} />
        <Stat label={t.reportsPage.completed} value={data.leadFinder.completedSearches.toLocaleString()} note={t.reportsPage.searchesLabel} icon={<ShieldCheck size={22} />} />
        <Stat label={t.reportsPage.failed} value={data.leadFinder.failedSearches.toLocaleString()} note={t.reportsPage.searchesLabel} icon={<TrendingUp size={22} />} />
      </div>
      <Card className="mt-8" title={t.reportsPage.searchTrend}>
        <LineTrendChart data={data.leadFinder.trend} color="#d97706" />
      </Card>
      <Card className="mt-8" title={t.reportsPage.searchResultsByType}>
        <BarRows data={data.leadFinder.resultsByType} color="#d97706" />
      </Card>

      {/* Plan Usage */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.planUsage}</h2>
      <Card>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-neutral-600 dark:text-neutral-400">
            {t.reportsPage.currentPlan.replace("{plan}", "")}<strong className="dark:text-white">{data.usage.planName ?? t.reportsPage.noActivePlan}</strong>
          </p>
          {data.usage.planName && <Pill tone="dark">{t.reportsPage.monthlyUsage}</Pill>}
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <CircularUsageChart label={t.reportsPage.usageSearches} used={data.usage.searches.used} limit={data.usage.searches.limit} />
          <CircularUsageChart label={t.reportsPage.usageLeads} used={data.usage.leads.used} limit={data.usage.leads.limit} />
          <CircularUsageChart label={t.reportsPage.usageEmails} used={data.usage.emails.used} limit={data.usage.emails.limit} />
          <CircularUsageChart label={t.reportsPage.usageChatbot} used={data.usage.chatbotConversations.used} limit={data.usage.chatbotConversations.limit} />
        </div>
      </Card>

      {/* Performance Overview */}
      <h2 className="mb-4 mt-12 text-2xl font-black tracking-tight">{t.reportsPage.performanceOverview}</h2>
      <Card>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
            {t.reportsPage.scoreDisclaimer}
          </span>
          <strong className="text-5xl font-black dark:text-white">{t.reportsPage.scoreOutOf100.replace("{score}", String(data.performanceScore))}</strong>
          <p className="mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            {t.reportsPage.scoreFootnote}
          </p>
        </div>
      </Card>
    </main>
  );
}
