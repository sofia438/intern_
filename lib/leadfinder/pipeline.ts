import "server-only";

import { prisma } from "@/lib/prisma";
import { countryName, countryLanguage, countryTld } from "@/lib/leadfinder/countries";
import { generateKeywords, translateProductName, scoreCandidates } from "@/lib/leadfinder/groq";
import { searchCompanies, type SearchCandidate, type SearchEngine } from "@/lib/leadfinder/search";
import { scrapeWebsite, mapWithConcurrency } from "@/lib/leadfinder/scrape";

const SCORE_THRESHOLD = 50;
const MAX_RESULTS_TO_SCRAPE = 30;
const SCRAPE_CONCURRENCY = 5;
const SCORE_BATCH_SIZE = 20;
const COMPETITOR_TERMS = ["distributor", "importer", "wholesaler", "supplier"];

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

type CandidateWithCountry = SearchCandidate & { country: string };

export async function runSearchJob(jobId: string): Promise<void> {
  try {
    const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    await prisma.searchJob.update({ where: { id: jobId }, data: { status: "RUNNING" } });

    // Step 1: per-country keyword generation + translation, then search.
    // generateKeywords/translateProductName/searchCompanies are all
    // internally resilient (never throw, degrade to safe defaults).
    const candidatesByCountry = new Map<string, SearchCandidate[]>();

    for (const countryCode of job.countries) {
      const cName = countryName(countryCode);
      const language = countryLanguage(countryCode);

      const keywords = await generateKeywords({
        productName: job.productName,
        oemNumber: job.oemNumber,
        hsCode: job.hsCode,
        imageDescription: job.imageDescription,
        countryName: cName,
      });

      const translatedName = await translateProductName(job.productName, language);

      const queries = [...keywords];
      if (translatedName) {
        queries.push(`${translatedName} ${cName}`);
      }

      job.competitorBrands.forEach((brand, i) => {
        const term = COMPETITOR_TERMS[i % COMPETITOR_TERMS.length];
        queries.push(`${brand} ${term} ${cName}`);
      });

      job.relatedIndustries.forEach((industry) => {
        queries.push(`${job.productName} supplier for ${industry} ${cName}`);
      });

      const tld = countryTld(countryCode);
      if (tld) {
        queries.push(`${job.productName} distributor site:${tld}`);
      }

      const countryCandidates: SearchCandidate[] = [];
      for (const query of queries) {
        for (const engine of job.searchEngines as SearchEngine[]) {
          const results = await searchCompanies(query, countryCode, engine);
          countryCandidates.push(...results);
        }
      }

      candidatesByCountry.set(countryCode, countryCandidates);
    }

    // Step 2: dedupe by hostname across the whole job.
    const seenHostnames = new Set<string>();
    const dedupedCandidates: CandidateWithCountry[] = [];

    for (const [countryCode, candidates] of candidatesByCountry) {
      for (const candidate of candidates) {
        const hostname = hostnameOf(candidate.link);
        if (!hostname || seenHostnames.has(hostname)) continue;
        seenHostnames.add(hostname);
        dedupedCandidates.push({ ...candidate, country: countryCode });
      }
    }

    // Step 3: batched AI relevance scoring.
    const productContext = [job.productName, job.oemNumber, job.hsCode, job.imageDescription]
      .filter(Boolean)
      .join(" | ");

    const scores = new Map<string, number>();
    for (let i = 0; i < dedupedCandidates.length; i += SCORE_BATCH_SIZE) {
      const batch = dedupedCandidates.slice(i, i + SCORE_BATCH_SIZE);
      const batchScores = await scoreCandidates(batch, productContext);
      for (const [link, score] of Object.entries(batchScores)) {
        scores.set(link, score);
      }
    }

    const scored = dedupedCandidates
      .map((c) => ({ ...c, confidenceScore: scores.get(c.link) ?? null }))
      .filter((c): c is CandidateWithCountry & { confidenceScore: number } =>
        c.confidenceScore !== null && c.confidenceScore >= SCORE_THRESHOLD
      )
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, MAX_RESULTS_TO_SCRAPE);

    // Step 4: concurrency-limited scraping.
    const scraped = await mapWithConcurrency(scored, SCRAPE_CONCURRENCY, async (candidate) => {
      const contact = await scrapeWebsite(candidate.link);
      return { ...candidate, ...contact };
    });

    // Step 5: persist.
    if (scraped.length > 0) {
      await prisma.searchResult.createMany({
        data: scraped.map((r) => ({
          searchJobId: jobId,
          companyName: r.companyName ?? r.title,
          website: r.link,
          country: countryName(r.country),
          email: r.email,
          phone: r.phone,
          address: r.address,
          confidenceScore: r.confidenceScore,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", resultsCount: scraped.length, completedAt: new Date() },
    });
  } catch (error) {
    await prisma.searchJob
      .update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown error",
          completedAt: new Date(),
        },
      })
      .catch(() => {});
  }
}
