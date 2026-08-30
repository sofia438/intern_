"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Download } from "lucide-react";

import { REPORTS_RANGE_OPTIONS, type ReportsFilters } from "@/lib/reportsShared";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ReportsFilterBar({
  filters,
  filterOptions,
}: {
  filters: ReportsFilters;
  filterOptions: { countries: string[]; campaigns: { id: string; label: string }[]; products: string[] };
}) {
  const { dictionary: t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/reports?${params.toString()}`);
  }

  const selectClass =
    "h-11 rounded border border-[#d5d7dd] bg-white px-3 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100";

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-full border border-[#d5d7dd] bg-[#f4f2f2] p-1 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
          {REPORTS_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParam("range", option.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition sm:px-4 sm:text-sm ${
                filters.range === option.value
                  ? "bg-white text-black shadow-sm dark:bg-[#242424] dark:text-white"
                  : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              {t.reportsFilterBar.range[option.value]}
            </button>
          ))}
        </div>

        <a
          href={`/api/reports/export?${searchParams.toString()}`}
          className="inline-flex items-center gap-2 rounded bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-[#222] dark:bg-neutral-100 dark:text-black"
        >
          <Download size={16} /> {t.reportsFilterBar.exportReport}
        </a>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={filters.country ?? ""}
          onChange={(e) => updateParam("country", e.target.value)}
          className={selectClass}
        >
          <option value="">{t.reportsFilterBar.allCountries}</option>
          {filterOptions.countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.searchType ?? ""}
          onChange={(e) => updateParam("searchType", e.target.value)}
          className={selectClass}
        >
          <option value="">{t.reportsFilterBar.allSearchTypes}</option>
          <option value="WEBSITE">{t.reportsFilterBar.websiteSearch}</option>
          <option value="MAPS">{t.reportsFilterBar.mapsSearch}</option>
        </select>

        <select
          value={filters.campaignId ?? ""}
          onChange={(e) => updateParam("campaignId", e.target.value)}
          className={selectClass}
        >
          <option value="">{t.reportsFilterBar.allCampaigns}</option>
          {filterOptions.campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={filters.product ?? ""}
          onChange={(e) => updateParam("product", e.target.value)}
          className={selectClass}
        >
          <option value="">{t.reportsFilterBar.allProducts}</option>
          {filterOptions.products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select disabled value="chatbot" className={`${selectClass} opacity-60`} title={t.reportsFilterBar.leadSourceChatbotTitle}>
          <option value="chatbot">{t.reportsFilterBar.leadSourceChatbot}</option>
        </select>

        {(filters.country || filters.searchType || filters.campaignId || filters.product) && (
          <button
            type="button"
            onClick={() => router.push(`/reports?range=${filters.range}`)}
            className="text-sm font-bold text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
          >
            {t.reportsFilterBar.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}
