"use client";

import { useState } from "react";

import LeadFinderForm, { type SavedProductOption } from "@/components/dashboard/LeadFinderForm";
import MapsSearchForm from "@/components/dashboard/MapsSearchForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Tab = "website" | "maps";

export default function LeadFinderTabs({ products }: { products: SavedProductOption[] }) {
  const { dictionary: t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>("website");

  return (
    <div>
      <div className="mb-8 flex overflow-x-auto border-b border-[#dfe2e7] dark:border-[#3a3a3a]">
        <button
          type="button"
          onClick={() => setActiveTab("website")}
          className={`shrink-0 whitespace-nowrap px-4 py-4 font-mono text-sm uppercase tracking-[0.12em] sm:px-6 ${
            activeTab === "website"
              ? "border-b-2 border-black font-bold dark:border-white dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {t.leadFinderTabs.websiteSearch}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("maps")}
          className={`shrink-0 whitespace-nowrap px-4 py-4 font-mono text-sm uppercase tracking-[0.12em] sm:px-6 ${
            activeTab === "maps"
              ? "border-b-2 border-black font-bold dark:border-white dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          {t.leadFinderTabs.mapsSearch}
        </button>
      </div>

      {activeTab === "website" ? <LeadFinderForm products={products} /> : <MapsSearchForm />}
    </div>
  );
}
