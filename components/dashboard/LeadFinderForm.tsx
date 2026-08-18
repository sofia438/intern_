"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import { startSearchJob } from "@/app/actions/leadfinder";
import { Card, Field } from "@/components/dashboard/DashboardScreens";
import { SUPPORTED_COUNTRIES } from "@/lib/leadfinder/countries";

const ALL_COUNTRIES_SORTED = [...SUPPORTED_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

function CountryDropdown({ selected, onToggle }: { selected: Set<string>; onToggle: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const term = search.trim().toLowerCase();
  const filtered = ALL_COUNTRIES_SORTED.filter(
    (c) => c.name.toLowerCase().startsWith(term) || c.code.toLowerCase().startsWith(term)
  );

  const selectedCountry = ALL_COUNTRIES_SORTED.find((c) => selected.has(c.code));
  const summary =
    selected.size === 0
      ? "Select countries"
      : selected.size === 1
        ? (selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : "1 country selected")
        : `${selected.size} countries selected`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-full items-center justify-between rounded border border-[#d5d7dd] bg-white px-4 text-left text-base outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
      >
        <span className={selected.size === 0 ? "text-neutral-400 dark:text-neutral-500" : ""}>{summary}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full rounded border border-[#d5d7dd] bg-white shadow-lg dark:border-[#3a3a3a] dark:bg-[#242424]">
          <div className="border-b border-[#ececec] p-3 dark:border-[#3a3a3a]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              autoFocus
              className="w-full rounded border border-[#d5d7dd] px-3 py-2 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-neutral-500 dark:text-neutral-400">No countries match.</p>
            ) : (
              filtered.map((country) => (
                <label
                  key={country.code}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-[#2e2e2e]"
                >
                  <input
                    type="checkbox"
                    name="countries"
                    value={country.code}
                    checked={selected.has(country.code)}
                    onChange={() => onToggle(country.code)}
                  />
                  {country.name} <span className="text-neutral-400 dark:text-neutral-500">({country.code})</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadFinderForm() {
  const [state, action, pending] = useActionState(startSearchJob, undefined);
  const [imageDescription, setImageDescription] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set(["google"]));
  const [competitorBrands, setCompetitorBrands] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [suggestedIndustries, setSuggestedIndustries] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set());
  const [industriesStatus, setIndustriesStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);

  function toggleCountry(code: string) {
    setSelectedCountries((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function toggleEngine(engine: string) {
    setSelectedEngines((prev) => {
      const next = new Set(prev);
      if (next.has(engine)) next.delete(engine);
      else next.add(engine);
      return next;
    });
  }

  function toggleIndustry(industry: string) {
    setSelectedIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(industry)) next.delete(industry);
      else next.add(industry);
      return next;
    });
  }

  function addCompetitor() {
    const trimmed = competitorInput.trim();
    if (trimmed && !competitorBrands.includes(trimmed)) {
      setCompetitorBrands((prev) => [...prev, trimmed]);
    }
    setCompetitorInput("");
  }

  function removeCompetitor(brand: string) {
    setCompetitorBrands((prev) => prev.filter((b) => b !== brand));
  }

  async function suggestIndustries() {
    const fd = new FormData(formRef.current ?? undefined);
    const productName = fd.get("productName")?.toString().trim();
    if (!productName) return;

    setIndustriesStatus("loading");

    try {
      const response = await fetch("/api/lead-finder/related-industries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          oemNumber: fd.get("oemNumber")?.toString() || undefined,
          hsCode: fd.get("hsCode")?.toString() || undefined,
          imageDescription: imageDescription || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setSuggestedIndustries(Array.isArray(data.industries) ? data.industries : []);
      setIndustriesStatus("done");
    } catch {
      setIndustriesStatus("error");
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageStatus("loading");
    setImageDescription(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/lead-finder/image-recognize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed");

      const data = await response.json();
      setImageDescription(data.description ?? null);
      setImageStatus("done");
    } catch {
      setImageStatus("error");
    }
  }

  return (
    <form ref={formRef} action={action} className="grid grid-cols-[2fr_1fr] gap-8">
      <Card>
        <div className="mb-8 border-b pb-4 font-mono uppercase tracking-[0.12em]">
          <strong className="border-b-2 border-black pb-3">Define Your Product</strong>
        </div>

        <Field label="Product Name" name="productName" placeholder="e.g. Brake Pad" />
        {state?.errors?.productName && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.productName[0]}</p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-8">
          <Field label="OEM Number / Serial" name="oemNumber" placeholder="e.g. 04465-0K240" />
          <Field label="HS Code (6-12 digits)" name="hsCode" placeholder="e.g. 870830" />
        </div>

        <div className="mt-8">
          <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
            Product Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#041B3A] file:px-5 file:py-2.5 file:font-bold file:text-white file:transition hover:file:bg-[#072955] dark:text-neutral-400"
          />
          <input type="hidden" name="imageDescription" value={imageDescription ?? ""} />
          {imageStatus === "loading" && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Identifying image…</p>}
          {imageStatus === "done" && imageDescription && (
            <p className="mt-2 text-sm text-[#5b6300] dark:text-[#c7d400]">AI identified: {imageDescription}</p>
          )}
          {imageStatus === "error" && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">Couldn&apos;t analyze that image, continuing without it.</p>
          )}
        </div>

        <div className="mt-8">
          <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
            Competitor Brands (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={competitorInput}
              onChange={(e) => setCompetitorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCompetitor();
                }
              }}
              placeholder="e.g. Bosch"
              className="flex-1 rounded border border-[#d5d7dd] p-3 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={addCompetitor}
              className="rounded bg-[#041B3A] px-5 font-bold text-white transition hover:bg-[#072955]"
            >
              +
            </button>
          </div>
          {competitorBrands.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {competitorBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f1eee8] px-3 py-1 text-sm dark:bg-[#3a3a3a] dark:text-neutral-200"
                >
                  {brand}
                  <button type="button" onClick={() => removeCompetitor(brand)} aria-label={`Remove ${brand}`}>
                    <X className="h-3.5 w-3.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
                  </button>
                  <input type="hidden" name="competitorBrands" value={brand} />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <label className="font-mono text-sm uppercase tracking-[0.12em]">Related Industries (optional)</label>
            <button
              type="button"
              onClick={suggestIndustries}
              disabled={industriesStatus === "loading"}
              className="text-sm font-bold text-[#041B3A] underline disabled:opacity-50 dark:text-[#7fa8ff]"
            >
              {industriesStatus === "loading" ? "Thinking…" : "Suggest with AI"}
            </button>
          </div>
          {industriesStatus === "error" && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">Couldn&apos;t generate suggestions, try again.</p>
          )}
          {suggestedIndustries.length > 0 && (
            <div className="mt-3 space-y-2 rounded border border-[#dfe2e7] p-4 dark:border-[#3a3a3a]">
              {suggestedIndustries.map((industry) => (
                <label key={industry} className="flex items-center gap-2 text-sm dark:text-neutral-200">
                  <input
                    type="checkbox"
                    name="relatedIndustries"
                    value={industry}
                    checked={selectedIndustries.has(industry)}
                    onChange={() => toggleIndustry(industry)}
                  />
                  {industry}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <details className="rounded border border-[#dfe2e7] dark:border-[#3a3a3a]">
            <summary className="cursor-pointer select-none px-4 py-3 font-mono text-sm uppercase tracking-[0.12em] hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]">
              Search Engine{" "}
              <span className="ml-1 normal-case tracking-normal text-neutral-500 dark:text-neutral-400">
                ({selectedEngines.size > 0 ? `${selectedEngines.size} selected` : "none selected"})
              </span>
            </summary>
            <div className="space-y-2 border-t border-[#ececec] p-4 dark:border-[#3a3a3a]">
              <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                <input
                  type="checkbox"
                  name="searchEngines"
                  value="google"
                  checked={selectedEngines.has("google")}
                  onChange={() => toggleEngine("google")}
                />
                Google
              </label>
              <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                <input
                  type="checkbox"
                  name="searchEngines"
                  value="bing"
                  checked={selectedEngines.has("bing")}
                  onChange={() => toggleEngine("bing")}
                />
                Bing
              </label>
              <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                <input
                  type="checkbox"
                  name="searchEngines"
                  value="yandex"
                  checked={selectedEngines.has("yandex")}
                  onChange={() => toggleEngine("yandex")}
                />
                Yandex
              </label>
            </div>
          </details>
          {state?.errors?.searchEngines && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.searchEngines[0]}</p>
          )}
        </div>

        {state?.message && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{state.message}</p>}

        <div className="mt-10 border-t pt-10 text-right dark:border-[#3a3a3a]">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-3 bg-black px-12 py-5 text-xl font-black text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-black"
          >
            {pending ? "Starting…" : "Start Search →"}
          </button>
        </div>
      </Card>

      <Card title="Target Countries">
        {state?.errors?.countries && selectedCountries.size === 0 && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{state.errors.countries[0]}</p>
        )}
        <CountryDropdown selected={selectedCountries} onToggle={toggleCountry} />
      </Card>
    </form>
  );
}
