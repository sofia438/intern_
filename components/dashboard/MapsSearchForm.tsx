"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { startMapsSearchJob } from "@/app/actions/mapsSearch";
import { Card, Field } from "@/components/dashboard/DashboardScreens";
import { SUPPORTED_COUNTRIES } from "@/lib/leadfinder/countries";

function CityAutocomplete({
  countryCode,
  countryLabel,
  value,
  onChange,
}: {
  countryCode: string;
  countryLabel: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    onChange(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (next.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/lead-finder/city-search?q=${encodeURIComponent(next)}&country=${countryCode}`
        );
        const data = await response.json();
        setSuggestions(Array.isArray(data.cities) ? data.cities : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 400);
  }

  function selectSuggestion(city: string) {
    onChange(city);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div className="relative">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-neutral-600 dark:text-neutral-400">
        {countryLabel}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="City (optional)"
        className="w-full rounded border border-[#d5d7dd] px-3 py-2.5 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded border border-[#d5d7dd] bg-white shadow-lg dark:border-[#3a3a3a] dark:bg-[#242424]">
          {suggestions.map((city) => (
            <button
              type="button"
              key={city}
              onMouseDown={() => selectSuggestion(city)}
              className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-[#2e2e2e]"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapsSearchForm() {
  const [state, action, pending] = useActionState(startMapsSearchJob, undefined);
  const [countrySearch, setCountrySearch] = useState("");
  const [selectedCountries, setSelectedCountries] = useState<{ code: string; name: string }[]>([]);
  const [cityByCountry, setCityByCountry] = useState<Record<string, string>>({});

  const filteredCountries = useMemo(() => {
    const term = countrySearch.trim().toLowerCase();
    if (!term) return SUPPORTED_COUNTRIES;
    return SUPPORTED_COUNTRIES.filter(
      (c) => c.name.toLowerCase().startsWith(term) || c.code.toLowerCase().startsWith(term)
    );
  }, [countrySearch]);

  const selectedCodes = useMemo(() => new Set(selectedCountries.map((c) => c.code)), [selectedCountries]);

  function toggleCountry(country: { code: string; name: string }) {
    setSelectedCountries((prev) =>
      prev.some((c) => c.code === country.code)
        ? prev.filter((c) => c.code !== country.code)
        : [...prev, country]
    );
  }

  function removeCountry(code: string) {
    setSelectedCountries((prev) => prev.filter((c) => c.code !== code));
  }

  function setCityForCountry(code: string, city: string) {
    setCityByCountry((prev) => ({ ...prev, [code]: city }));
  }

  return (
    <form action={action}>
      <Card>
        <div className="mb-8 border-b pb-4 font-mono uppercase tracking-[0.12em]">
          <strong className="border-b-2 border-black pb-3">Find Businesses on Maps</strong>
        </div>

        <div>
          <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">Countries</span>
          <details className="rounded border border-[#d5d7dd] dark:border-[#3a3a3a]">
            <summary className="flex h-14 cursor-pointer select-none items-center px-5 text-lg dark:text-neutral-100">
              {selectedCountries.length > 0 ? (
                <span>{selectedCountries.length} selected</span>
              ) : (
                <span className="text-neutral-400 dark:text-neutral-500">Select countries</span>
              )}
            </summary>
            <div className="border-t border-[#ececec] p-3 dark:border-[#3a3a3a]">
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search countries..."
                className="mb-2 w-full rounded border border-[#d5d7dd] px-3 py-2 text-sm outline-none focus:border-black dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-100"
              />
              <div className="max-h-56 overflow-y-auto">
                {filteredCountries.length === 0 ? (
                  <p className="p-2 text-sm text-neutral-500 dark:text-neutral-400">No countries match.</p>
                ) : (
                  filteredCountries.map((country) => (
                    <label
                      key={country.code}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-[#2e2e2e]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCodes.has(country.code)}
                        onChange={() => toggleCountry(country)}
                      />
                      {country.name} <span className="text-neutral-400 dark:text-neutral-500">({country.code})</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </details>
          {selectedCountries.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCountries.map((country) => (
                <span
                  key={country.code}
                  className="inline-flex items-center gap-2 rounded-full bg-[#f1eee8] px-3 py-1 text-sm dark:bg-[#3a3a3a] dark:text-neutral-200"
                >
                  {country.name}
                  <button type="button" onClick={() => removeCountry(country.code)} aria-label={`Remove ${country.name}`}>
                    <X className="h-3.5 w-3.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white" />
                  </button>
                  <input type="hidden" name="countries" value={country.code} />
                </span>
              ))}
            </div>
          )}
        </div>
        {state?.errors?.countries && selectedCountries.length === 0 && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.countries[0]}</p>
        )}

        {selectedCountries.length > 0 && (
          <div className="mt-8">
            <span className="mb-2 block font-mono text-sm uppercase tracking-[0.12em]">
              City per country (optional)
            </span>
            <div className="grid grid-cols-2 gap-4">
              {selectedCountries.map((country) => (
                <div key={country.code}>
                  <CityAutocomplete
                    countryCode={country.code}
                    countryLabel={country.name}
                    value={cityByCountry[country.code] ?? ""}
                    onChange={(city) => setCityForCountry(country.code, city)}
                  />
                  <input type="hidden" name="cityCountry" value={country.code} />
                  <input type="hidden" name="cityValue" value={cityByCountry[country.code] ?? ""} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-2 gap-8">
          <Field label="Keyword(s)" name="keyword" placeholder="e.g. CNC Machining" />
          <Field label="Industry" name="industry" placeholder="e.g. Manufacturing" />
        </div>
        {state?.errors?.keyword && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{state.errors.keyword[0]}</p>}

        {state?.message && <p className="mt-6 text-sm text-red-600 dark:text-red-400">{state.message}</p>}

        <div className="mt-10 border-t pt-10 text-right dark:border-[#3a3a3a]">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-3 bg-black px-12 py-5 text-xl font-black text-white disabled:opacity-60 dark:bg-neutral-100 dark:text-black"
          >
            {pending ? "Starting…" : "Search Maps →"}
          </button>
        </div>
      </Card>
    </form>
  );
}
