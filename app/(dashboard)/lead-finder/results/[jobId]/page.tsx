import { notFound } from "next/navigation";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import LeadFinderResultsPoll from "@/components/dashboard/LeadFinderResultsPoll";
import LeadFinderResultsTable from "@/components/dashboard/LeadFinderResultsTable";
import MapsResultsTable from "@/components/dashboard/MapsResultsTable";
import { startContactFinder } from "@/app/actions/contactFinder";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { countryName } from "@/lib/leadfinder/countries";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await verifySession();
  const { jobId } = await params;

  const job = await prisma.searchJob.findUnique({
    where: { id: jobId },
    include: { results: { orderBy: { confidenceScore: "desc" } } },
  });

  if (!job || job.companyId !== session.companyId) {
    notFound();
  }

  const isRunning = job.status === "PENDING" || job.status === "RUNNING";
  const statusTone = job.status === "COMPLETED" ? "acid" : job.status === "FAILED" ? "danger" : "soft";

  const contactFinderRunning =
    job.contactFinderStatus === "PENDING" || job.contactFinderStatus === "RUNNING";
  const canFindContacts =
    job.searchType === "WEBSITE" &&
    job.status === "COMPLETED" &&
    job.contactFinderStatus !== "PENDING" &&
    job.contactFinderStatus !== "RUNNING";

  return (
    <main className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-tight">{job.productName}</h1>
          <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
            {job.countries.map((c) => countryName(c)).join(", ")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Pill tone={statusTone}>{job.status}</Pill>
          {canFindContacts && (
            <form action={startContactFinder}>
              <input type="hidden" name="jobId" value={job.id} />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-[#222]"
              >
                Find Contacts →
              </button>
            </form>
          )}
          {contactFinderRunning && (
            <Pill tone="soft">Finding contacts…</Pill>
          )}
        </div>
      </div>

      {job.status === "FAILED" && (
        <Card className="mb-8">
          <p className="text-red-600 dark:text-red-400">Search failed: {job.errorMessage ?? "Unknown error"}</p>
        </Card>
      )}

      {(isRunning || contactFinderRunning) && <LeadFinderResultsPoll />}

      <Card className="mt-6">
        {job.results.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            {isRunning ? "Searching…" : "No results found for this search."}
          </p>
        ) : job.searchType === "MAPS" ? (
          <MapsResultsTable jobId={job.id} results={job.results} canExport={job.status === "COMPLETED"} />
        ) : (
          <LeadFinderResultsTable
            jobId={job.id}
            results={job.results}
            canExport={job.status === "COMPLETED"}
          />
        )}
      </Card>
    </main>
  );
}
