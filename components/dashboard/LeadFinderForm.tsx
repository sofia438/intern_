"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ChevronDown, UploadCloud, X } from "lucide-react";

import { startSearchJob } from "@/app/actions/leadfinder";
import { Card, Field } from "@/components/dashboard/DashboardScreens";
import { SUPPORTED_COUNTRIES } from "@/lib/leadfinder/countries";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ALL_COUNTRIES_SORTED = [...SUPPORTED_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

export type SavedProductOption = {
  id: string;
  name: string;
  englishName: string | null;
  hsCode: string | null;
  hasImage: boolean;
};

function CountryDropdown({ selected, onToggle }: { selected: Set<string>; onToggle: (code: string) => void }) {
  const { dictionary: t } = useLanguage();
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
      ? t.leadFinderForm.selectCountries
      : selected.size === 1
        ? (selectedCountry ? `${selectedCountry.name} (${selectedCountry.code})` : t.leadFinderForm.countrySelected)
        : t.leadFinderForm.countriesSelected.replace("{count}", String(selected.size));

  return (
    <div ref={containerRef} className="relative">
      {/* Always-mounted, independent of dropdown open/closed state — the checkboxes
          inside the dropdown panel below are unmounted on close, so they can't be
          relied on to carry form data at submit time. */}
      {Array.from(selected).map((code) => (
        <input key={code} type="hidden" name="countries" value={code} />
      ))}

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
              placeholder={t.leadFinderForm.searchCountriesPlaceholder}
              autoFocus
              className="w-full rounded border border-[#d5d7dd] px-3 py-2 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
            />
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="p-3 text-sm text-neutral-500 dark:text-neutral-400">{t.leadFinderForm.noCountriesMatch}</p>
            ) : (
              filtered.map((country) => (
                <label
                  key={country.code}
                  className="flex cursor-pointer items-center gap-3 rounded px-3 py-2 text-sm hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-[#2e2e2e]"
                >
                  <input
                    type="checkbox"
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

export default function LeadFinderForm({ products }: { products: SavedProductOption[] }) {
  const { dictionary: t } = useLanguage();
  const [state, action, pending] = useActionState(startSearchJob, undefined);
  const [imageDescription, setImageDescription] = useState<string | null>(null);
  const [imageIdentification, setImageIdentification] = useState<{
    product: string;
    category: string;
    partNumber: string | null;
    brand: string | null;
  } | null>(null);
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [hsCode, setHsCode] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [savedProductImage, setSavedProductImage] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<Set<string>>(new Set());
  const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set(["google"]));
  const [competitorBrands, setCompetitorBrands] = useState<string[]>([]);
  const [competitorInput, setCompetitorInput] = useState("");
  const [industry, setIndustry] = useState("");
  const [potentialCustomerWebsites, setPotentialCustomerWebsites] = useState<string[]>([]);
  const [potentialCustomerWebsiteInput, setPotentialCustomerWebsiteInput] = useState("");
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

  function addPotentialCustomerWebsite() {
    const trimmed = potentialCustomerWebsiteInput.trim();
    if (trimmed && !potentialCustomerWebsites.includes(trimmed)) {
      setPotentialCustomerWebsites((prev) => [...prev, trimmed]);
    }
    setPotentialCustomerWebsiteInput("");
  }

  function removePotentialCustomerWebsite(site: string) {
    setPotentialCustomerWebsites((prev) => prev.filter((s) => s !== site));
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

  function handleSelectProduct(productId: string) {
    setSelectedProductId(productId);

    if (!productId) {
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setProductName(product.englishName || product.name);
    setHsCode(product.hsCode ?? "");
    setImageFileName(null);
    setImageStatus("idle");
    setImageIdentification(null);

    if (product.hasImage) {
      setSavedProductImage(`/api/products/${product.id}/image`);
      setImageDescription(product.englishName || product.name);
    } else {
      setSavedProductImage(null);
      setImageDescription(null);
    }
  }

  async function processImage(file: File) {
    setSavedProductImage(null);
    setImageFileName(file.name);
    setImageStatus("loading");
    setImageDescription(null);
    setImageIdentification(null);

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
      setImageIdentification(data.identification ?? null);
      setImageStatus("done");
    } catch {
      setImageStatus("error");
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processImage(file);
  }

  function handleImageDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processImage(file);
  }

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
      <Card>
        <div className="mb-8 border-b pb-4 font-mono uppercase tracking-[0.12em]">
          <strong className="border-b-2 border-black pb-3">{t.leadFinderForm.defineYourProduct}</strong>
        </div>

        {products.length > 0 && (
          <label className="mb-8 block">
            <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">{t.leadFinderForm.savedProduct}</span>
            <select
              value={selectedProductId}
              onChange={(e) => handleSelectProduct(e.target.value)}
              className="h-14 w-full border border-[#d5d7dd] bg-white px-5 text-lg outline-none dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
            >
              <option value="">{t.leadFinderForm.customNewProduct}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.englishName || product.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <Field
          label={t.leadFinderForm.productName}
          name="productName"
          placeholder={t.leadFinderForm.productNamePlaceholder}
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        {state?.errors?.productName && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.productName[0]}</p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Field label={t.leadFinderForm.oemNumber} name="oemNumber" placeholder={t.leadFinderForm.oemNumberPlaceholder} />
          <Field
            label={t.leadFinderForm.hsCode}
            name="hsCode"
            placeholder={t.leadFinderForm.hsCodePlaceholder}
            value={hsCode}
            onChange={(e) => setHsCode(e.target.value)}
          />
        </div>

        <div className="mt-8">
          <Field
            label={t.leadFinderForm.targetIndustry}
            name="industry"
            placeholder={t.leadFinderForm.targetIndustryPlaceholder}
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div className="mt-8">
          <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
            {t.leadFinderForm.productImage}
          </label>
          {savedProductImage ? (
            <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-[#c9caf0] bg-[#f7f7fd] p-4 dark:border-[#3a3a5a] dark:bg-[#232336]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={savedProductImage} alt="Saved product" className="h-16 w-16 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-[#6a5cf5]">{t.leadFinderForm.usingSavedImage}</p>
                <label htmlFor="productImage" className="cursor-pointer text-sm text-neutral-500 underline dark:text-neutral-400">
                  {t.leadFinderForm.uploadDifferentImage}
                </label>
              </div>
              <input id="productImage" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          ) : (
            <label
              htmlFor="productImage"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleImageDrop}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#c9caf0] bg-[#f7f7fd] px-6 py-10 text-center transition hover:border-[#6a5cf5] dark:border-[#3a3a5a] dark:bg-[#232336]"
            >
              <UploadCloud className="h-9 w-9 text-[#6a5cf5]" />
              <span className="font-bold text-[#6a5cf5]">{imageFileName ?? t.leadFinderForm.importYourImage}</span>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">{t.leadFinderForm.dragOrClickToUpload}</span>
              <input
                id="productImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          <input type="hidden" name="imageDescription" value={imageDescription ?? ""} />
          {imageStatus === "loading" && <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">{t.leadFinderForm.identifyingImage}</p>}
          {imageStatus === "done" && imageIdentification && (
            <div className="mt-2 rounded-lg bg-[#f7f8e8] p-4 text-sm dark:bg-[#2a2c1a]">
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[#5b6300] dark:text-[#c7d400]">
                <dt className="font-mono text-xs uppercase tracking-[0.08em] opacity-70">{t.leadFinderForm.detectedProduct}:</dt>
                <dd>{imageIdentification.product}</dd>
                <dt className="font-mono text-xs uppercase tracking-[0.08em] opacity-70">{t.leadFinderForm.category}:</dt>
                <dd>{imageIdentification.category}</dd>
                <dt className="font-mono text-xs uppercase tracking-[0.08em] opacity-70">{t.leadFinderForm.partNumber}:</dt>
                <dd>{imageIdentification.partNumber ?? t.leadFinderForm.notDetected}</dd>
                <dt className="font-mono text-xs uppercase tracking-[0.08em] opacity-70">{t.leadFinderForm.brand}:</dt>
                <dd>{imageIdentification.brand ?? t.leadFinderForm.notDetected}</dd>
              </dl>
            </div>
          )}
          {imageStatus === "error" && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{t.leadFinderForm.imageAnalyzeError}</p>
          )}
        </div>

        <div className="mt-8">
          <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
            {t.leadFinderForm.competitorBrands}
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
              placeholder={t.leadFinderForm.competitorBrandsPlaceholder}
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
                  <button type="button" onClick={() => removeCompetitor(brand)} aria-label={t.leadFinderForm.removeBrand.replace("{brand}", brand)}>
                    <X className="h-3.5 w-3.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
                  </button>
                  <input type="hidden" name="competitorBrands" value={brand} />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <label className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
            {t.leadFinderForm.potentialCustomerWebsites}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={potentialCustomerWebsiteInput}
              onChange={(e) => setPotentialCustomerWebsiteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPotentialCustomerWebsite();
                }
              }}
              placeholder={t.leadFinderForm.potentialCustomerWebsitesPlaceholder}
              className="flex-1 rounded border border-[#d5d7dd] p-3 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
            />
            <button
              type="button"
              onClick={addPotentialCustomerWebsite}
              className="rounded bg-[#041B3A] px-5 font-bold text-white transition hover:bg-[#072955]"
            >
              +
            </button>
          </div>
          {potentialCustomerWebsites.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {potentialCustomerWebsites.map((site) => (
                <span
                  key={site}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f1eee8] px-3 py-1 text-sm dark:bg-[#3a3a3a] dark:text-neutral-200"
                >
                  {site}
                  <button
                    type="button"
                    onClick={() => removePotentialCustomerWebsite(site)}
                    aria-label={t.leadFinderForm.removePotentialCustomerWebsite.replace("{site}", site)}
                  >
                    <X className="h-3.5 w-3.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
                  </button>
                  <input type="hidden" name="potentialCustomerWebsites" value={site} />
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <label className="font-mono text-sm uppercase tracking-[0.12em]">{t.leadFinderForm.relatedIndustries}</label>
            <button
              type="button"
              onClick={suggestIndustries}
              disabled={industriesStatus === "loading"}
              className="text-sm font-bold text-[#041B3A] underline disabled:opacity-50 dark:text-[#7fa8ff]"
            >
              {industriesStatus === "loading" ? t.leadFinderForm.thinking : t.leadFinderForm.suggestWithAi}
            </button>
          </div>
          {industriesStatus === "error" && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{t.leadFinderForm.suggestError}</p>
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
              {t.leadFinderForm.searchEngine}{" "}
              <span className="ml-1 normal-case tracking-normal text-neutral-500 dark:text-neutral-400">
                ({selectedEngines.size > 0 ? t.leadFinderForm.selectedCount.replace("{count}", String(selectedEngines.size)) : t.leadFinderForm.noneSelected})
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
                {t.leadFinderForm.google}
              </label>
              <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                <input
                  type="checkbox"
                  name="searchEngines"
                  value="bing"
                  checked={selectedEngines.has("bing")}
                  onChange={() => toggleEngine("bing")}
                />
                {t.leadFinderForm.bing}
              </label>
              <label className="flex items-center gap-2 text-sm dark:text-neutral-200">
                <input
                  type="checkbox"
                  name="searchEngines"
                  value="yandex"
                  checked={selectedEngines.has("yandex")}
                  onChange={() => toggleEngine("yandex")}
                />
                {t.leadFinderForm.yandex}
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
            {pending ? t.leadFinderForm.starting : t.leadFinderForm.startSearch}
          </button>
        </div>
      </Card>

      <Card title={t.leadFinderForm.targetCountries}>
        {state?.errors?.countries && selectedCountries.size === 0 && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{state.errors.countries[0]}</p>
        )}
        <CountryDropdown selected={selectedCountries} onToggle={toggleCountry} />
      </Card>
    </form>
  );
}
