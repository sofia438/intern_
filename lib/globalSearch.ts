import "server-only";

import { prisma } from "@/lib/prisma";

export type GlobalSearchResult = {
  id: string;
  company: string;
  website: string | null;
  country: string | null;
  searchJobId: string;
};

const RESULT_LIMIT = 8;

export async function searchLeads(companyId: string, query: string): Promise<GlobalSearchResult[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const results = await prisma.searchResult.findMany({
    where: {
      searchJob: { companyId },
      OR: [
        { companyName: { contains: term, mode: "insensitive" } },
        { website: { contains: term, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: RESULT_LIMIT,
    select: { id: true, companyName: true, website: true, country: true, searchJobId: true },
  });

  return results
    .filter((r) => r.companyName)
    .map((r) => ({
      id: r.id,
      company: r.companyName!,
      website: r.website,
      country: r.country,
      searchJobId: r.searchJobId,
    }));
}
