"use client";

import { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type MapsResultRow = {
  id: string;
  companyName: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  rating: number | null;
  reviewsCount: number | null;
  category: string | null;
  country: string | null;
};

type FilterType = "hasEmail" | "hasWebsite" | "hasPhone" | "minRating" | "category";

type ActiveFilter =
  | { type: "hasEmail"; value: "yes" | "no" }
  | { type: "hasWebsite"; value: "yes" | "no" }
  | { type: "hasPhone"; value: "yes" | "no" }
  | { type: "minRating"; value: number }
  | { type: "category"; value: string };

function filterLabels(t: Dictionary): Record<FilterType, string> {
  return {
    hasEmail: t.mapsResults.filterHasEmail,
    hasWebsite: t.mapsResults.filterHasWebsite,
    hasPhone: t.mapsResults.filterHasPhone,
    minRating: t.mapsResults.filterMinRating,
    category: t.mapsResults.filterCategory,
  };
}

const ALL_FILTER_TYPES: FilterType[] = ["hasEmail", "hasWebsite", "hasPhone", "minRating", "category"];
const RATING_OPTIONS = [4.5, 4, 3, 2];

function filterLabel(filter: ActiveFilter, t: Dictionary): string {
  if (filter.type === "minRating") return `${filter.value}+`;
  if (filter.type === "category") return filter.value;
  return filter.value === "yes" ? t.common.yes : t.common.no;
}

export default function MapsResultsTable({
  jobId,
  results,
  canExport,
}: {
  jobId: string;
  results: MapsResultRow[];
  canExport: boolean;
}) {
  const { dictionary: t } = useLanguage();
  const FILTER_LABELS = filterLabels(t);
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilter[]>([]);
  const [draftFilters, setDraftFilters] = useState<ActiveFilter[]>([]);
  const [pickerType, setPickerType] = useState<FilterType | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(results.map((r) => r.category).filter((c): c is string => !!c))).sort(),
    [results]
  );

  const availableFilterTypes = ALL_FILTER_TYPES.filter((type) => !draftFilters.some((f) => f.type === type));

  function openPanel() {
    setDraftFilters(appliedFilters);
    setPickerType(null);
    setPanelOpen(true);
  }

  function addFilter(filter: ActiveFilter) {
    setDraftFilters((prev) => [...prev.filter((f) => f.type !== filter.type), filter]);
    setPickerType(null);
  }

  function removeFilter(type: FilterType) {
    setDraftFilters((prev) => prev.filter((f) => f.type !== type));
  }

  function applyFilters() {
    setAppliedFilters(draftFilters);
    setPanelOpen(false);
  }

  function resetFilters() {
    setDraftFilters([]);
    setAppliedFilters([]);
    setPanelOpen(false);
  }

  const filteredResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    return results.filter((r) => {
      if (term) {
        const haystack = `${r.companyName ?? ""} ${r.address ?? ""} ${r.email ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      for (const filter of appliedFilters) {
        if (filter.type === "hasEmail") {
          const has = !!r.email;
          if (filter.value === "yes" && !has) return false;
          if (filter.value === "no" && has) return false;
        }
        if (filter.type === "hasWebsite") {
          const has = !!r.website;
          if (filter.value === "yes" && !has) return false;
          if (filter.value === "no" && has) return false;
        }
        if (filter.type === "hasPhone") {
          const has = !!r.phone;
          if (filter.value === "yes" && !has) return false;
          if (filter.value === "no" && has) return false;
        }
        if (filter.type === "minRating") {
          if (r.rating == null || r.rating < filter.value) return false;
        }
        if (filter.type === "category" && r.category !== filter.value) return false;
      }
      return true;
    });
  }, [results, search, appliedFilters]);

  const exportHref = `/api/lead-finder/${jobId}/export?ids=${filteredResults.map((r) => r.id).join(",")}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-black dark:text-white">
          {filteredResults.length === results.length
            ? t.mapsResults.businessesFound.replace("{count}", String(results.length))
            : t.mapsResults.businessesFoundOf.replace("{count}", String(filteredResults.length)).replace("{total}", String(results.length))}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.mapsResults.searchBusinessesPlaceholder}
              className="w-64 rounded border border-[#d5d7dd] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => (panelOpen ? setPanelOpen(false) : openPanel())}
              className="inline-flex items-center gap-2 rounded border border-[#d5d7dd] bg-white px-4 py-2.5 text-sm font-bold hover:bg-neutral-50 dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100 dark:hover:bg-[#3a3a3a]"
            >
              <Filter className="h-4 w-4" />
              {t.common.filters.label}
              {appliedFilters.length > 0 && (
                <span className="ml-1 rounded-full bg-[#07172b] px-1.5 py-0.5 text-xs text-white">
                  {appliedFilters.length}
                </span>
              )}
            </button>

            {panelOpen && (
              <div className="absolute right-0 z-10 mt-2 w-80 rounded-md border border-[#dfe2e7] bg-white p-5 shadow-lg dark:border-[#3a3a3a] dark:bg-[#242424]">
                <p className="mb-3 font-mono text-sm uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400">{t.common.filters.label}</p>

                {draftFilters.length === 0 && (
                  <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">{t.common.filters.empty}</p>
                )}

                <div className="mb-3 space-y-2">
                  {draftFilters.map((filter) => (
                    <div
                      key={filter.type}
                      className="flex items-center justify-between rounded border border-[#ececec] bg-[#f9f8f6] px-3 py-2 text-sm dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
                    >
                      <span>
                        <strong>{FILTER_LABELS[filter.type]}:</strong> {filterLabel(filter, t)}
                      </span>
                      <button type="button" onClick={() => removeFilter(filter.type)} aria-label={t.common.filters.remove}>
                        <X className="h-4 w-4 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                {pickerType ? (
                  <div className="mb-3 rounded border border-[#ececec] p-3 dark:border-[#3a3a3a]">
                    <p className="mb-2 text-sm font-bold dark:text-white">{FILTER_LABELS[pickerType]}</p>
                    {pickerType === "hasEmail" && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-email-picker"
                            onChange={() => addFilter({ type: "hasEmail", value: "yes" })}
                          />
                          {t.common.yes}
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-email-picker"
                            onChange={() => addFilter({ type: "hasEmail", value: "no" })}
                          />
                          {t.common.no}
                        </label>
                      </div>
                    )}
                    {pickerType === "hasWebsite" && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-website-picker"
                            onChange={() => addFilter({ type: "hasWebsite", value: "yes" })}
                          />
                          {t.common.yes}
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-website-picker"
                            onChange={() => addFilter({ type: "hasWebsite", value: "no" })}
                          />
                          {t.common.no}
                        </label>
                      </div>
                    )}
                    {pickerType === "hasPhone" && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-phone-picker"
                            onChange={() => addFilter({ type: "hasPhone", value: "yes" })}
                          />
                          {t.common.yes}
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-phone-picker"
                            onChange={() => addFilter({ type: "hasPhone", value: "no" })}
                          />
                          {t.common.no}
                        </label>
                      </div>
                    )}
                    {pickerType === "minRating" && (
                      <div className="space-y-1.5">
                        {RATING_OPTIONS.map((r) => (
                          <label key={r} className="flex items-center gap-2 text-sm dark:text-neutral-200">
                            <input
                              type="radio"
                              name="min-rating-picker"
                              onChange={() => addFilter({ type: "minRating", value: r })}
                            />
                            {t.mapsResults.starsSuffix.replace("{rating}", String(r))}
                          </label>
                        ))}
                      </div>
                    )}
                    {pickerType === "category" && (
                      <div className="max-h-40 space-y-1.5 overflow-y-auto">
                        {categories.length === 0 ? (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t.mapsResults.noCategoriesInResults}</p>
                        ) : (
                          categories.map((c) => (
                            <label key={c} className="flex items-center gap-2 text-sm dark:text-neutral-200">
                              <input
                                type="radio"
                                name="category-picker"
                                onChange={() => addFilter({ type: "category", value: c })}
                              />
                              {c}
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  availableFilterTypes.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => setPickerType(e.target.value as FilterType)}
                      className="mb-3 w-full rounded border border-[#d5d7dd] p-2 text-sm dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
                    >
                      <option value="" disabled>
                        {t.common.filters.addPlaceholder}
                      </option>
                      {availableFilterTypes.map((type) => (
                        <option key={type} value={type}>
                          {FILTER_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  )
                )}

                <div className="flex justify-between border-t border-[#ececec] pt-3 dark:border-[#3a3a3a]">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-sm font-bold text-neutral-600 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                  >
                    {t.common.filters.reset}
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="rounded bg-[#07172b] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2547]"
                  >
                    {t.common.filters.apply}
                  </button>
                </div>
              </div>
            )}
          </div>

          {canExport && (
            <a
              href={filteredResults.length > 0 ? exportHref : undefined}
              aria-disabled={filteredResults.length === 0}
              className={`inline-flex items-center gap-2 rounded bg-black px-5 py-2.5 text-sm font-bold text-white ${
                filteredResults.length === 0 ? "pointer-events-none opacity-50" : "hover:bg-[#222]"
              }`}
            >
              {t.common.exportExcel}
            </a>
          )}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">{t.mapsResults.noMatch}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-[#dfe2e7] dark:border-[#3a3a3a]">
          <table className="w-full min-w-[1200px] text-left">
            <thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600 dark:bg-[#3a3a3a] dark:text-neutral-300">
              <tr>
                <th className="p-4">{t.mapsResults.tableCompany}</th>
                <th className="p-4">{t.mapsResults.tableCategory}</th>
                <th className="p-4">{t.mapsResults.tablePhone}</th>
                <th className="p-4">{t.mapsResults.tableEmail}</th>
                <th className="p-4">{t.mapsResults.tableOpeningHours}</th>
                <th className="p-4">{t.mapsResults.tableAddress}</th>
                <th className="p-4">{t.mapsResults.tableCountry}</th>
                <th className="p-4">{t.mapsResults.tableRating}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#242424]">
              {filteredResults.map((result) => (
                <tr className="border-t border-[#e5e5e5] dark:border-[#3a3a3a] dark:text-neutral-100" key={result.id}>
                  <td className="p-4">
                    <strong className="dark:text-white">{result.companyName ?? t.common.unknown}</strong>
                    {result.website && (
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm text-blue-600 underline dark:text-blue-400"
                      >
                        {t.mapsResults.website}
                      </a>
                    )}
                  </td>
                  <td className="whitespace-nowrap p-4">{result.category ?? "—"}</td>
                  <td className="whitespace-nowrap p-4">{result.phone ?? "—"}</td>
                  <td className="p-4">{result.email ?? "—"}</td>
                  <td className="max-w-[220px] truncate p-4" title={result.openingHours ?? undefined}>
                    {result.openingHours ?? "—"}
                  </td>
                  <td className="max-w-[220px] truncate p-4" title={result.address ?? undefined}>
                    {result.address ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(result.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline dark:text-blue-400"
                      >
                        📍 {result.address}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap p-4">{result.country ?? "—"}</td>
                  <td className="whitespace-nowrap p-4">
                    {result.rating != null ? `★ ${result.rating}${result.reviewsCount != null ? ` (${result.reviewsCount})` : ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
