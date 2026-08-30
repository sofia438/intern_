import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { verifySession } from "@/lib/dal";
import { getReportsData, isReportsRange, type ReportsFilters } from "@/lib/reports";

export async function GET(request: Request) {
  const session = await verifySession();
  const { searchParams } = new URL(request.url);

  const filters: ReportsFilters = {
    range: isReportsRange(searchParams.get("range") ?? "") ? (searchParams.get("range") as ReportsFilters["range"]) : "30d",
    country: searchParams.get("country") || undefined,
    searchType: searchParams.get("searchType") === "WEBSITE" || searchParams.get("searchType") === "MAPS" ? (searchParams.get("searchType") as "WEBSITE" | "MAPS") : undefined,
    campaignId: searchParams.get("campaignId") || undefined,
    product: searchParams.get("product") || undefined,
  };

  const data = await getReportsData(session.companyId, filters);

  const workbook = new ExcelJS.Workbook();

  const kpiSheet = workbook.addWorksheet("KPIs");
  kpiSheet.columns = [
    { header: "Metric", key: "metric", width: 28 },
    { header: "Value", key: "value", width: 16 },
    { header: "vs Prior Period", key: "delta", width: 18 },
  ];
  const kpiRow = (metric: string, k: { value: number; deltaPct: number | null }) =>
    kpiSheet.addRow({ metric, value: k.value, delta: k.deltaPct === null ? "—" : `${k.deltaPct >= 0 ? "+" : ""}${k.deltaPct.toFixed(1)}%` });
  kpiRow("Total Leads", data.kpis.totalLeads);
  kpiRow("Website Visitors", data.kpis.websiteVisitors);
  kpiRow("Identified Companies", data.kpis.identifiedCompanies);
  kpiRow("Countries Reached", data.kpis.countriesReached);
  kpiRow("Emails Sent", data.kpis.emailsSent);
  kpiRow("Active Campaigns", data.kpis.activeCampaigns);
  kpiSheet.addRow({});
  kpiSheet.addRow({ metric: "Performance Score", value: `${data.performanceScore} / 100` });
  kpiSheet.addRow({ metric: "Report Range", value: data.rangeLabel });

  const leadTrendSheet = workbook.addWorksheet("Lead Trend");
  leadTrendSheet.columns = [{ header: "Date", key: "label", width: 14 }, { header: "Leads", key: "value", width: 12 }];
  data.leadPerformance.trend.forEach((r) => leadTrendSheet.addRow(r));

  const leadCountrySheet = workbook.addWorksheet("Leads by Country");
  leadCountrySheet.columns = [{ header: "Country", key: "label", width: 24 }, { header: "Leads", key: "value", width: 12 }];
  data.leadPerformance.byCountry.forEach((r) => leadCountrySheet.addRow(r));

  const visitorSheet = workbook.addWorksheet("Visitor Trend");
  visitorSheet.columns = [{ header: "Date", key: "label", width: 14 }, { header: "Visitors", key: "value", width: 12 }];
  data.visitorIntelligence.trend.forEach((r) => visitorSheet.addRow(r));

  const geoSheet = workbook.addWorksheet("Geographic Distribution");
  geoSheet.columns = [
    { header: "Country", key: "country", width: 24 },
    { header: "Visitors", key: "count", width: 12 },
    { header: "Share", key: "percentage", width: 12 },
  ];
  data.visitorIntelligence.geo.countries.forEach((c) =>
    geoSheet.addRow({ country: c.country, count: c.count, percentage: `${c.percentage.toFixed(1)}%` })
  );

  const campaignSheet = workbook.addWorksheet("Campaign Performance");
  campaignSheet.columns = [
    { header: "Campaign", key: "label", width: 32 },
    { header: "Recipients", key: "recipients", width: 14 },
    { header: "Sent", key: "sent", width: 12 },
    { header: "Failed", key: "failed", width: 12 },
    { header: "Unsubscribed", key: "unsubscribed", width: 16 },
  ];
  data.emailPerformance.campaignPerformance.forEach((c) => campaignSheet.addRow({ label: c.label, ...c.values }));

  const searchSheet = workbook.addWorksheet("Search Performance");
  searchSheet.columns = [{ header: "Metric", key: "metric", width: 28 }, { header: "Value", key: "value", width: 16 }];
  searchSheet.addRow({ metric: "Total Searches", value: data.leadFinder.totalSearches });
  searchSheet.addRow({ metric: "Website Searches", value: data.leadFinder.websiteSearches });
  searchSheet.addRow({ metric: "Maps Searches", value: data.leadFinder.mapsSearches });
  searchSheet.addRow({ metric: "Completed", value: data.leadFinder.completedSearches });
  searchSheet.addRow({ metric: "Failed", value: data.leadFinder.failedSearches });
  searchSheet.addRow({ metric: "Total Results", value: data.leadFinder.totalResults });
  searchSheet.addRow({ metric: "Avg Results / Search", value: data.leadFinder.avgResultsPerSearch.toFixed(1) });

  const usageSheet = workbook.addWorksheet("Plan Usage");
  usageSheet.columns = [
    { header: "Metric", key: "metric", width: 20 },
    { header: "Used", key: "used", width: 14 },
    { header: "Limit", key: "limit", width: 14 },
  ];
  usageSheet.addRow({ metric: "Plan", used: data.usage.planName ?? "No active plan", limit: "" });
  usageSheet.addRow({ metric: "Searches", used: data.usage.searches.used, limit: data.usage.searches.limit });
  usageSheet.addRow({ metric: "Leads", used: data.usage.leads.used, limit: data.usage.leads.limit });
  usageSheet.addRow({ metric: "Emails", used: data.usage.emails.used, limit: data.usage.emails.limit });
  usageSheet.addRow({ metric: "Chatbot Conversations", used: data.usage.chatbotConversations.used, limit: data.usage.chatbotConversations.limit });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="globalexpo-report-${filters.range}.xlsx"`,
    },
  });
}
