"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import type { GlobalSearchResult } from "@/lib/globalSearch";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DEBOUNCE_MS = 250;

export default function HeaderSearch({ placeholder }: { placeholder: string }) {
  const { dictionary: t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        if (!response.ok) throw new Error("Failed");
        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setResults([]);
      } finally {
        setStatus("done");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative hidden w-full max-w-[420px] md:block">
      <label className="flex h-12 w-full items-center gap-3 rounded border border-[#d5d7dd] bg-[#f4f2f2] px-4 text-neutral-500 dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-400">
        <Search size={22} className="shrink-0" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent outline-none"
        />
      </label>

      {showDropdown && (
        <div className="absolute left-0 top-full z-20 mt-2 w-full rounded border border-[#d5d7dd] bg-white shadow-lg dark:border-[#3a3a3a] dark:bg-[#242424]">
          {status === "loading" ? (
            <p className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">{t.headerSearch.searching}</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
              {t.headerSearch.noMatch.replace("{query}", query.trim())}
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <Link
                    href={`/lead-finder/results/${result.searchJobId}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold dark:text-white">{result.company}</span>
                      {result.website && (
                        <span className="block truncate text-xs text-neutral-500 dark:text-neutral-400">{result.website}</span>
                      )}
                    </span>
                    {result.country && (
                      <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">{result.country}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
