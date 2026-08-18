import "server-only";

import { prisma } from "@/lib/prisma";
import { countryName, countryLanguage } from "@/lib/leadfinder/countries";
import { geocodeCity, geocodeCountry } from "@/lib/geo";
import { generateMapsKeywords, translateProductName } from "@/lib/leadfinder/groq";
import { searchGoogleMaps, type MapsCandidate } from "@/lib/leadfinder/mapsSearch";
import { scrapeWebsite, mapWithConcurrency } from "@/lib/leadfinder/scrape";

const SCRAPE_CONCURRENCY = 5;
// No radius input anymore: a city search zooms in close, a whole-country
// search (no city given) zooms out wide from the country's centroid.
const CITY_ZOOM = 12;
const COUNTRY_ZOOM = 6;

function formatOpeningHours(hours: Record<string, string> | null): string | null {
  if (!hours) return null;
  const entries = Object.entries(hours);
  if (entries.length === 0) return null;
  return entries.map(([day, value]) => `${day.charAt(0).toUpperCase()}${day.slice(1)}: ${value}`).join(", ");
}

type CandidateWithCountry = MapsCandidate & { countryCode: string };

export async function runMapsSearchJob(jobId: string): Promise<void> {
  try {
    const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    await prisma.searchJob.update({ where: { id: jobId }, data: { status: "RUNNING" } });

    const allCandidates: CandidateWithCountry[] = [];
    const cityByCountry = (job.cityByCountry as Record<string, string> | null) ?? {};

    for (const countryCode of job.countries) {
      const cName = countryName(countryCode);
      const language = countryLanguage(countryCode);

      const keywords = await generateMapsKeywords({
        productName: job.productName,
        industry: job.industry,
        countryName: cName,
      });

      const translated = await translateProductName(job.productName, language);

      const queries = [...keywords];
      if (translated) {
        queries.push(translated);
      }

      // Each country can have its own chosen city now. If none was picked for
      // this country, fall back to the country's own centroid — the search
      // then zooms out to cover the whole country instead of just a city.
      const cityForCountry = cityByCountry[countryCode];
      const cityCoords = cityForCountry ? await geocodeCity(cityForCountry, countryCode) : null;
      const coords = cityCoords ?? (await geocodeCountry(countryCode));
      const zoom = cityCoords ? CITY_ZOOM : COUNTRY_ZOOM;

      for (const query of queries) {
        const results = await searchGoogleMaps(query, coords?.lat ?? null, coords?.lng ?? null, zoom);
        allCandidates.push(...results.map((r) => ({ ...r, countryCode })));
      }
    }

    // Dedupe across countries/queries by Google's own place_id.
    const seenPlaceIds = new Set<string>();
    const deduped: CandidateWithCountry[] = [];
    for (const candidate of allCandidates) {
      if (candidate.placeId) {
        if (seenPlaceIds.has(candidate.placeId)) continue;
        seenPlaceIds.add(candidate.placeId);
      }
      deduped.push(candidate);
    }

    const enriched = await mapWithConcurrency(deduped, SCRAPE_CONCURRENCY, async (candidate) => {
      if (!candidate.website) return { ...candidate, email: null as string | null };
      const contact = await scrapeWebsite(candidate.website);
      return { ...candidate, email: contact.email };
    });

    if (enriched.length > 0) {
      await prisma.searchResult.createMany({
        data: enriched.map((r) => ({
          searchJobId: jobId,
          companyName: r.title,
          website: r.website,
          country: countryName(r.countryCode),
          email: r.email,
          phone: r.phone,
          address: r.address,
          openingHours: formatOpeningHours(r.operatingHours),
          rating: r.rating,
          reviewsCount: r.reviews,
          category: r.category,
        })),
        skipDuplicates: true,
      });
    }

    await prisma.searchJob.update({
      where: { id: jobId },
      data: { status: "COMPLETED", resultsCount: enriched.length, completedAt: new Date() },
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
