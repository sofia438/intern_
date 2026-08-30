

export type ReportsRange = "today" | "7d" | "30d" | "90d" | "this_month" | "last_month" | "all";

export const REPORTS_RANGE_OPTIONS: { value: ReportsRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "all", label: "All Time" },
];

export function isReportsRange(value: string): value is ReportsRange {
  return REPORTS_RANGE_OPTIONS.some((r) => r.value === value);
}

export type ReportsFilters = {
  range: ReportsRange;
  country?: string;
  searchType?: "WEBSITE" | "MAPS";
  campaignId?: string;
  product?: string;
};
