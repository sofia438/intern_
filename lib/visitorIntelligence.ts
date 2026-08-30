import "server-only";

import { prisma } from "@/lib/prisma";
import { countryMapName, type CityStat, type CountryStat, type GeoDistribution, type GeoRange } from "@/lib/visitorIntelligenceShared";

export { GEO_RANGE_OPTIONS, isGeoRange, countryMapName } from "@/lib/visitorIntelligenceShared";
export type { GeoRange, CountryStat, CityStat, GeoDistribution } from "@/lib/visitorIntelligenceShared";

function rangeCutoff(range: GeoRange): Date | null {
  const hoursByRange: Record<GeoRange, number | null> = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30, "90d": 24 * 90, all: null };
  const hours = hoursByRange[range];
  if (hours === null) return null;
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - hours);
  return cutoff;
}

const TOP_N = 5;
const OTHER_LABEL = "Other";

export async function getGeographicDistribution(
  companyId: string,
  range: GeoRange,
  countryFilter?: string
): Promise<GeoDistribution> {
  const cutoff = rangeCutoff(range);

  const rows = await prisma.websiteVisitor.findMany({
    where: {
      companyId,
      ...(cutoff && { lastVisit: { gte: cutoff } }),
    },
    select: { country: true, city: true },
  });

  const withCountry = rows.filter((r): r is { country: string; city: string | null } => !!r.country);
  const total = withCountry.length;

  // --- Countries ---
  const countryCounts = new Map<string, number>();
  for (const row of withCountry) {
    countryCounts.set(row.country, (countryCounts.get(row.country) ?? 0) + 1);
  }
  const sortedCountries = Array.from(countryCounts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const topCountries = sortedCountries.slice(0, TOP_N);
  const otherCountries = sortedCountries.slice(TOP_N);
  const otherCountryCount = otherCountries.reduce((sum, e) => sum + e.count, 0);

  const countries: CountryStat[] = topCountries.map((e) => ({
    country: e.country,
    mapName: countryMapName(e.country),
    count: e.count,
    percentage: total > 0 ? (e.count / total) * 100 : 0,
  }));
  if (otherCountries.length > 0) {
    countries.push({
      country: OTHER_LABEL,
      mapName: "",
      count: otherCountryCount,
      percentage: total > 0 ? (otherCountryCount / total) * 100 : 0,
    });
  }

  // --- Cities (optionally scoped to a single country for drill-down) ---
  const cityScope = countryFilter ? withCountry.filter((r) => r.country === countryFilter) : withCountry;
  const cityTotal = cityScope.length;

  const cityCounts = new Map<string, { country: string; count: number }>();
  for (const row of cityScope) {
    if (!row.city) continue;
    const existing = cityCounts.get(row.city);
    if (existing) existing.count += 1;
    else cityCounts.set(row.city, { country: row.country, count: 1 });
  }
  const sortedCities = Array.from(cityCounts.entries())
    .map(([city, v]) => ({ city, country: v.country, count: v.count }))
    .sort((a, b) => b.count - a.count);

  const topCities = sortedCities.slice(0, TOP_N);
  const otherCities = sortedCities.slice(TOP_N);
  const otherCityCount = otherCities.reduce((sum, e) => sum + e.count, 0);

  const cities: CityStat[] = topCities.map((e) => ({
    city: e.city,
    country: e.country,
    count: e.count,
    percentage: cityTotal > 0 ? (e.count / cityTotal) * 100 : 0,
  }));
  if (otherCities.length > 0) {
    cities.push({
      city: OTHER_LABEL,
      country: "",
      count: otherCityCount,
      percentage: cityTotal > 0 ? (otherCityCount / cityTotal) * 100 : 0,
    });
  }

  return { total, countries, cities };
}
