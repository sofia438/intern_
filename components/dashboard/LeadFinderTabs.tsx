"use client";

import { useState } from "react";

import LeadFinderForm from "@/components/dashboard/LeadFinderForm";
import MapsSearchForm from "@/components/dashboard/MapsSearchForm";

type Tab = "website" | "maps";

export default function LeadFinderTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("website");

  return (
    <div>
      <div className="mb-8 flex border-b border-[#dfe2e7] dark:border-[#3a3a3a]">
        <button
          type="button"
          onClick={() => setActiveTab("website")}
          className={`px-6 py-4 font-mono text-sm uppercase tracking-[0.12em] ${
            activeTab === "website"
              ? "border-b-2 border-black font-bold dark:border-white dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Website Search
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("maps")}
          className={`px-6 py-4 font-mono text-sm uppercase tracking-[0.12em] ${
            activeTab === "maps"
              ? "border-b-2 border-black font-bold dark:border-white dark:text-white"
              : "text-neutral-500 dark:text-neutral-400"
          }`}
        >
          Maps Search
        </button>
        <span className="cursor-not-allowed px-6 py-4 font-mono text-sm uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-600">
          Trade Database Search (Coming soon)
        </span>
      </div>

      {activeTab === "website" ? <LeadFinderForm /> : <MapsSearchForm />}
    </div>
  );
}
