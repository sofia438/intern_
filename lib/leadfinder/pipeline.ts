import "server-only";

import { prisma } from "@/lib/prisma";
import { countryName, countryLanguage, countryTld } from "@/lib/leadfinder/countries";
import { generateKeywords, translateProductName, scoreCandidates, analyzeReferenceWebsites, type CandidateScore } from "@/lib/leadfinder/groq";
import { searchCompanies, type SearchCandidate, type SearchEngine } from "@/lib/leadfinder/search";
import { scrapeWebsite, scrapePageText, mapWithConcurrency } from "@/lib/leadfinder/scrape";

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

    
    let referenceSummary: string | null = null;
    if (job.potentialCustomerWebsites.length > 0) {
      const referencePages = await mapWithConcurrency(
        job.potentialCustomerWebsites,
        SCRAPE_CONCURRENCY,
        async (url) => ({ url, text: await scrapePageText(url) })
      );
      referenceSummary = await analyzeReferenceWebsites(referencePages);
    }

    
    const candidatesByCountry = new Map<string, SearchCandidate[]>();

    for (const countryCode of job.countries) {
      const cName = countryName(countryCode);
      const language = countryLanguage(countryCode);

      const keywords = await generateKeywords({
        productName: job.productName,
        oemNumber: job.oemNumber,
        hsCode: job.hsCode,
        imageDescription: job.imageDescription,
        industry: job.industry,
        referenceSummary,
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

    
    const productContext = [job.productName, job.oemNumber, job.hsCode, job.imageDescription, job.industry]
      .filter(Boolean)
      .join(" | ");
    const scoreExtraContext = referenceSummary
      ? `Example target-customer profile (from user-provided reference sites): ${referenceSummary}`
      : undefined;

    const scores = new Map<string, CandidateScore>();
    for (let i = 0; i < dedupedCandidates.length; i += SCORE_BATCH_SIZE) {
      const batch = dedupedCandidates.slice(i, i + SCORE_BATCH_SIZE);
      const batchScores = await scoreCandidates(batch, productContext, scoreExtraContext);
      for (const [link, s] of Object.entries(batchScores)) {
        scores.set(link, s);
      }
    }

    const scored = dedupedCandidates
      .map((c) => {
        const s = scores.get(c.link);
        return { ...c, confidenceScore: s?.score ?? null, websiteType: s?.websiteType ?? null, matchReason: s?.matchReason ?? null };
      })
      .filter((c): c is CandidateWithCountry & {
        confidenceScore: number;
        websiteType: "Company Website" | "E-commerce" | null;
        matchReason: string | null;
      } => c.confidenceScore !== null && c.confidenceScore >= SCORE_THRESHOLD)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, MAX_RESULTS_TO_SCRAPE);

   
    const scraped = await mapWithConcurrency(scored, SCRAPE_CONCURRENCY, async (candidate) => {
      const contact = await scrapeWebsite(candidate.link);
      return { ...candidate, ...contact };
    });

    
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
          websiteType: r.websiteType,
          matchReason: r.matchReason,
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
