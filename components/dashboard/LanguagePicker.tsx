"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LANGUAGES } from "@/lib/i18n/languages";

export default function LanguagePicker() {
  const { language, setLanguage, dictionary: t } = useLanguage();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return LANGUAGES;
    return LANGUAGES.filter(
      (l) => l.nativeName.toLowerCase().includes(term) || l.englishName.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <div>
      <h2 className="text-2xl font-black dark:text-white">{t.languagePicker.heading}</h2>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t.languagePicker.subtitle}</p>

      <label className="mt-5 flex h-11 items-center gap-2 rounded border border-[#d5d7dd] bg-white px-3 text-sm text-neutral-500 dark:border-[#3a3a3a] dark:bg-[#2e2e2e] dark:text-neutral-400">
        <Search size={16} className="shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.languagePicker.searchPlaceholder}
          className="w-full min-w-0 bg-transparent outline-none"
        />
      </label>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((lang) => {
          const active = lang.code === language;
          return (
            <button
              key={lang.code}
              type="button"
              disabled={!lang.translated}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center justify-between gap-3 rounded border px-4 py-3 text-left transition ${
                active
                  ? "border-black bg-[#f0efed] dark:border-white dark:bg-[#3a3a3a]"
                  : lang.translated
                    ? "border-[#dfe2e7] hover:bg-neutral-50 dark:border-[#3a3a3a] dark:hover:bg-[#2e2e2e]"
                    : "cursor-not-allowed border-[#ececec] opacity-50 dark:border-[#3a3a3a]"
              }`}
            >
              <span>
                <strong className="block dark:text-white">{lang.nativeName}</strong>
                <span className="block text-sm text-neutral-500 dark:text-neutral-400">{lang.englishName}</span>
              </span>
              {active ? (
                <Check size={18} className="shrink-0 text-black dark:text-white" />
              ) : !lang.translated ? (
                <span className="shrink-0 rounded-full bg-[#efeeec] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-[#2e2e2e] dark:text-neutral-400">
                  {t.languagePicker.comingSoon}
                </span>
              ) : null}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No languages match &quot;{search}&quot;.</p>
        )}
      </div>
    </div>
  );
}
