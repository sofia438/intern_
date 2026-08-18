"use client";

import { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";

type ResultRow = {
  id: string;
  companyName: string | null;
  website: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  confidenceScore: number | null;
  contactName: string | null;
  contactTitle: string | null;
  contactEmail: string | null;
  contactConfidence: number | null;
  contactSourcePage: string | null;
};

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "aol.com",
  "icloud.com",
  "live.com",
  "protonmail.com",
  "yandex.com",
  "mail.com",
]);

function isCompanyEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return !!domain && !FREE_EMAIL_DOMAINS.has(domain);
}

type FilterType = "country" | "hasEmail" | "emailType" | "hasPhone" | "hasWebsite" | "hasContact";

type ActiveFilter =
  | { type: "country"; value: string }
  | { type: "hasEmail"; value: "yes" | "no" }
  | { type: "emailType"; value: "company" | "personal" }
  | { type: "hasPhone"; value: "yes" | "no" }
  | { type: "hasWebsite"; value: "yes" | "no" }
  | { type: "hasContact"; value: "yes" | "no" };

const FILTER_LABELS: Record<FilterType, string> = {
  country: "Country",
  hasEmail: "Has Email",
  emailType: "Email Type",
  hasPhone: "Has Phone",
  hasWebsite: "Has Website",
  hasContact: "Has Contact",
};

const ALL_FILTER_TYPES: FilterType[] = ["country", "hasEmail", "emailType", "hasPhone", "hasWebsite", "hasContact"];

function filterLabel(filter: ActiveFilter): string {
  if (filter.type === "country") return filter.value;
  if (filter.type === "emailType") return filter.value === "company" ? "Company Email Only" : "Personal Email";
  return filter.value === "yes" ? "Yes" : "No";
}

export default function LeadFinderResultsTable({
  jobId,
  results,
  canExport,
}: {
  jobId: string;
  results: ResultRow[];
  canExport: boolean;
}) {
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ActiveFilter[]>([]);
  const [draftFilters, setDraftFilters] = useState<ActiveFilter[]>([]);
  const [pickerType, setPickerType] = useState<FilterType | null>(null);

  const countries = useMemo(
    () => Array.from(new Set(results.map((r) => r.country).filter((c): c is string => !!c))).sort(),
    [results]
  );

  const availableFilterTypes = ALL_FILTER_TYPES.filter(
    (type) => !draftFilters.some((f) => f.type === type)
  );

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
        const haystack = `${r.companyName ?? ""} ${r.website ?? ""} ${r.email ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      for (const filter of appliedFilters) {
        if (filter.type === "country" && r.country !== filter.value) return false;
        if (filter.type === "hasEmail") {
          const hasEmail = !!r.email;
          if (filter.value === "yes" && !hasEmail) return false;
          if (filter.value === "no" && hasEmail) return false;
        }
        if (filter.type === "emailType") {
          if (!r.email) return false;
          const company = isCompanyEmail(r.email);
          if (filter.value === "company" && !company) return false;
          if (filter.value === "personal" && company) return false;
        }
        if (filter.type === "hasPhone") {
          const hasPhone = !!r.phone;
          if (filter.value === "yes" && !hasPhone) return false;
          if (filter.value === "no" && hasPhone) return false;
        }
        if (filter.type === "hasWebsite") {
          const hasWebsite = !!r.website;
          if (filter.value === "yes" && !hasWebsite) return false;
          if (filter.value === "no" && hasWebsite) return false;
        }
        if (filter.type === "hasContact") {
          const hasContact = !!r.contactEmail;
          if (filter.value === "yes" && !hasContact) return false;
          if (filter.value === "no" && hasContact) return false;
        }
      }
      return true;
    });
  }, [results, search, appliedFilters]);

  const exportHref = `/api/lead-finder/${jobId}/export?ids=${filteredResults.map((r) => r.id).join(",")}`;
  const hasContactData = results.some((r) => r.contactEmail);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-black dark:text-white">
          {filteredResults.length === results.length
            ? `${results.length} Companies Found`
            : `${filteredResults.length} of ${results.length} Companies Found`}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies..."
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
              Filters
              {appliedFilters.length > 0 && (
                <span className="ml-1 rounded-full bg-[#07172b] px-1.5 py-0.5 text-xs text-white">
                  {appliedFilters.length}
                </span>
              )}
            </button>

            {panelOpen && (
              <div className="absolute right-0 z-10 mt-2 w-80 rounded-md border border-[#dfe2e7] bg-white p-5 shadow-lg dark:border-[#3a3a3a] dark:bg-[#242424]">
                <p className="mb-3 font-mono text-sm uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-400">Filters</p>

                {draftFilters.length === 0 && (
                  <p className="mb-3 text-sm text-neutral-500 dark:text-neutral-400">No filters added yet.</p>
                )}

                <div className="mb-3 space-y-2">
                  {draftFilters.map((filter) => (
                    <div
                      key={filter.type}
                      className="flex items-center justify-between rounded border border-[#ececec] bg-[#f9f8f6] px-3 py-2 text-sm dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
                    >
                      <span>
                        <strong>{FILTER_LABELS[filter.type]}:</strong> {filterLabel(filter)}
                      </span>
                      <button type="button" onClick={() => removeFilter(filter.type)} aria-label="Remove filter">
                        <X className="h-4 w-4 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
                      </button>
                    </div>
                  ))}
                </div>

                {pickerType ? (
                  <div className="mb-3 rounded border border-[#ececec] p-3 dark:border-[#3a3a3a]">
                    <p className="mb-2 text-sm font-bold dark:text-white">{FILTER_LABELS[pickerType]}</p>
                    {pickerType === "country" && (
                      <div className="space-y-1.5">
                        {countries.map((c) => (
                          <label key={c} className="flex items-center gap-2 text-sm dark:text-neutral-200">
                            <input
                              type="radio"
                              name="country-picker"
                              onChange={() => addFilter({ type: "country", value: c })}
                            />
                            {c}
                          </label>
                        ))}
                      </div>
                    )}
                    {pickerType === "hasEmail" && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-email-picker"
                            onChange={() => addFilter({ type: "hasEmail", value: "yes" })}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-email-picker"
                            onChange={() => addFilter({ type: "hasEmail", value: "no" })}
                          />
                          No
                        </label>
                      </div>
                    )}
                    {pickerType === "emailType" && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="email-type-picker"
                            onChange={() => addFilter({ type: "emailType", value: "company" })}
                          />
                          Company Email Only
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="email-type-picker"
                            onChange={() => addFilter({ type: "emailType", value: "personal" })}
                          />
                          Personal Email
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
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-phone-picker"
                            onChange={() => addFilter({ type: "hasPhone", value: "no" })}
                          />
                          No
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
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-website-picker"
                            onChange={() => addFilter({ type: "hasWebsite", value: "no" })}
                          />
                          No
                        </label>
                      </div>
                    )}
                    {pickerType === "hasContact" && (
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-contact-picker"
                            onChange={() => addFilter({ type: "hasContact", value: "yes" })}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                          <input
                            type="radio"
                            name="has-contact-picker"
                            onChange={() => addFilter({ type: "hasContact", value: "no" })}
                          />
                          No
                        </label>
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
                        + Add Filter
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
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={applyFilters}
                    className="rounded bg-[#07172b] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2547]"
                  >
                    Apply Filters
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
              Export Excel
            </a>
          )}
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">No companies match your search/filters.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-[#dfe2e7] dark:border-[#3a3a3a]">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-[#f1eee8] font-mono text-sm uppercase tracking-[0.12em] text-neutral-600 dark:bg-[#3a3a3a] dark:text-neutral-300">
              {hasContactData ? (
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Website</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Recommended Email</th>
                  <th className="p-4">Confidence</th>
                </tr>
              ) : (
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Website</th>
                  <th className="p-4">Country</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Score</th>
                </tr>
              )}
            </thead>
            <tbody className="bg-white dark:bg-[#242424]">
              {filteredResults.map((result) => (
                <tr className="border-t border-[#e5e5e5] dark:border-[#3a3a3a] dark:text-neutral-100" key={result.id}>
                  <td className="p-4">
                    <strong className="dark:text-white">{result.companyName ?? "Unknown"}</strong>
                  </td>
                  <td className="max-w-xs truncate p-4">
                    {result.website ? (
                      <a
                        href={result.website}
                        target="_blank"
                        rel="noreferrer"
                        title={result.website}
                        className="text-blue-600 underline dark:text-blue-400"
                      >
                        {result.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  {hasContactData ? (
                    <>
                      <td className="whitespace-nowrap p-4">{result.contactName ?? "—"}</td>
                      <td className="whitespace-nowrap p-4">{result.contactTitle ?? "—"}</td>
                      <td className="p-4">{result.contactEmail ?? result.email ?? "—"}</td>
                      <td className="p-4">
                        {result.contactConfidence != null ? `${Math.round(result.contactConfidence)}%` : "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4">{result.country ?? "—"}</td>
                      <td className="p-4">{result.email ?? "—"}</td>
                      <td className="whitespace-nowrap p-4">{result.phone ?? "—"}</td>
                      <td className="p-4">
                        {result.confidenceScore != null ? Math.round(result.confidenceScore) : "—"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
