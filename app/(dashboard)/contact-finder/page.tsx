import Link from "next/link";

import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import { startContactFinder } from "@/app/actions/contactFinder";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page() {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);

  const eligibleJobs = await prisma.searchJob.findMany({
    where: { companyId: session.companyId, searchType: "WEBSITE", status: "COMPLETED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">{t.contactFinder.title}</h1>
        <p className="mt-2 text-xl text-neutral-600 dark:text-neutral-400">
          {t.contactFinder.subtitle}
        </p>
      </div>

      <Card title={t.contactFinder.startTitle}>
        {eligibleJobs.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">
            {t.contactFinder.emptyState}
          </p>
        ) : (
          <div className="divide-y divide-[#e5e5e5] dark:divide-[#3a3a3a]">
            {eligibleJobs.map((job) => {
              const running = job.contactFinderStatus === "PENDING" || job.contactFinderStatus === "RUNNING";
              const done = job.contactFinderStatus === "COMPLETED";

              return (
                <div key={job.id} className="flex items-center justify-between py-4">
                  <div>
                    <strong className="text-lg dark:text-white">{job.productName}</strong>
                    <small className="block text-neutral-500 dark:text-neutral-400">{t.contactFinder.companiesFound.replace("{count}", String(job.resultsCount))}</small>
                  </div>
                  <div className="flex items-center gap-4">
                    {done && (
                      <Pill tone="acid">{t.contactFinder.contactsFound.replace("{count}", String(job.contactFinderResultsCount ?? 0))}</Pill>
                    )}
                    {running && <Pill tone="soft">{t.contactFinder.findingContacts}</Pill>}
                    {done || running ? (
                      <Link
                        href={`/lead-finder/results/${job.id}`}
                        className="font-bold hover:underline dark:text-white"
                      >
                        {t.contactFinder.viewResults}
                      </Link>
                    ) : (
                      <form action={startContactFinder}>
                        <input type="hidden" name="jobId" value={job.id} />
                        <button type="submit" className="font-bold hover:underline dark:text-white">
                          {t.contactFinder.findContacts}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </main>
  );
}
