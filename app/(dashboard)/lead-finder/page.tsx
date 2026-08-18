import Link from "next/link";

import LeadFinderTabs from "@/components/dashboard/LeadFinderTabs";
import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { countryName } from "@/lib/leadfinder/countries";

const RANGE_OPTIONS = [
  { value: "1d", label: "1d", days: 1 },
  { value: "7d", label: "7d", days: 7 },
  { value: "30d", label: "30d", days: 30 },
  { value: "90d", label: "90d", days: 90 },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

function rangeCutoff(range: RangeValue): Date {
  const option = RANGE_OPTIONS.find((r) => r.value === range)!;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - option.days);
  return cutoff;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const session = await verifySession();
  const { range: rangeParam } = await searchParams;
  const range: RangeValue = RANGE_OPTIONS.some((r) => r.value === rangeParam) ? (rangeParam as RangeValue) : "30d";

  const [pastJobs, hasAnyJobs] = await Promise.all([
    prisma.searchJob.findMany({
      where: { companyId: session.companyId, createdAt: { gte: rangeCutoff(range) } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.searchJob.count({ where: { companyId: session.companyId } }).then((count) => count > 0),
  ]);

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">AI Lead Finder</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
          Find companies importing or distributing your product, worldwide.
        </p>
      </div>

      <LeadFinderTabs />

      {hasAnyJobs && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-black dark:text-white">Recent Searches</h2>
            <div className="inline-flex items-center gap-1 rounded-full border border-[#d5d7dd] bg-[#f4f2f2] p-1 dark:border-[#3a3a3a] dark:bg-[#2e2e2e]">
              {RANGE_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={`/lead-finder?range=${option.value}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                    range === option.value
                      ? "bg-white text-black shadow-sm dark:bg-[#242424] dark:text-white"
                      : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>

          <Card>
            {pastJobs.length === 0 ? (
              <p className="text-neutral-500 dark:text-neutral-400">No searches in the last {range}.</p>
            ) : (
              <div className="divide-y divide-[#e5e5e5] dark:divide-[#3a3a3a]">
                {pastJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/lead-finder/results/${job.id}`}
                    className="flex items-center justify-between py-4 hover:bg-neutral-50 dark:hover:bg-[#2e2e2e]"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-lg dark:text-white">{job.productName}</strong>
                        <Pill tone="dark">{job.searchType === "MAPS" ? "Maps" : "Website"}</Pill>
                      </div>
                      <small className="block text-neutral-500 dark:text-neutral-400">
                        {job.countries.map((c) => countryName(c)).join(", ")}
                        {(() => {
                          const cities = Object.values((job.cityByCountry as Record<string, string> | null) ?? {});
                          return cities.length > 0 ? ` · ${cities.join(", ")}` : "";
                        })()}
                      </small>
                    </div>
                    <div className="flex items-center gap-4">
                      <Pill tone={job.status === "COMPLETED" ? "acid" : job.status === "FAILED" ? "danger" : "soft"}>
                        {job.status}
                      </Pill>
                      <span>{job.resultsCount} results</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </main>
  );
}
