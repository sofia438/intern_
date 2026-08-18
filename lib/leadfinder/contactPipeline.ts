import "server-only";

import { prisma } from "@/lib/prisma";
import { findCompanyContact } from "@/lib/leadfinder/contactCrawl";
import { mapWithConcurrency } from "@/lib/leadfinder/scrape";

const COMPANY_CONCURRENCY = 3;

export async function runContactFinderJob(jobId: string): Promise<void> {
  try {
    const job = await prisma.searchJob.findUnique({
      where: { id: jobId },
      include: { results: true },
    });
    if (!job) return;

    await prisma.searchJob.update({ where: { id: jobId }, data: { contactFinderStatus: "RUNNING" } });

    const rowsWithWebsite = job.results.filter((r): r is typeof r & { website: string } => !!r.website);

    const enriched = await mapWithConcurrency(rowsWithWebsite, COMPANY_CONCURRENCY, async (row) => {
      const contact = await findCompanyContact(row.website);
      return { rowId: row.id, contact };
    });

    let resultsCount = 0;
    for (const { rowId, contact } of enriched) {
      if (!contact) continue;
      resultsCount++;
      await prisma.searchResult.update({
        where: { id: rowId },
        data: {
          contactName: contact.name,
          contactTitle: contact.title,
          contactEmail: contact.email,
          contactConfidence: contact.confidence,
          contactSourcePage: contact.sourcePage,
        },
      });
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: {
        contactFinderStatus: "COMPLETED",
        contactFinderResultsCount: resultsCount,
        contactFinderCompletedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.searchJob
      .update({
        where: { id: jobId },
        data: {
          contactFinderStatus: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          contactFinderCompletedAt: new Date(),
        },
      })
      .catch(() => {});
  }
}
