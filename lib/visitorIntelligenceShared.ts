
export type GeoRange = "24h" | "7d" | "30d" | "90d" | "all";

export const GEO_RANGE_OPTIONS: { value: GeoRange; hours: number | null }[] = [
  { value: "24h", hours: 24 },
  { value: "7d", hours: 24 * 7 },
  { value: "30d", hours: 24 * 30 },
  { value: "90d", hours: 24 * 90 },
  { value: "all", hours: null },
];

export function isGeoRange(value: string): value is GeoRange {
  return GEO_RANGE_OPTIONS.some((r) => r.value === value);
}


const COUNTRY_NAME_TO_MAP_NAME: Record<string, string> = {
  "United States": "United States of America",
  "Bosnia & Herzegovina": "Bosnia and Herz.",
  "Central African Republic": "Central African Rep.",
  "Congo - Brazzaville": "Congo",
  "Republic of the Congo": "Congo",
  "Congo - Kinshasa": "Dem. Rep. Congo",
  "Congo (Kinshasa)": "Dem. Rep. Congo",
  "Democratic Republic of the Congo": "Dem. Rep. Congo",
  "Dominican Republic": "Dominican Rep.",
  "Equatorial Guinea": "Eq. Guinea",
  "French Southern Territories": "Fr. S. Antarctic Lands",
  "North Macedonia": "Macedonia",
  "South Sudan": "S. Sudan",
  "Solomon Islands": "Solomon Is.",
  Eswatini: "eSwatini",
  "Myanmar (Burma)": "Myanmar",
  "Palestinian Territories": "Palestine",
  Türkiye: "Turkey",
};

export function countryMapName(storedCountryName: string): string {
  return COUNTRY_NAME_TO_MAP_NAME[storedCountryName] ?? storedCountryName;
}

export type CountryStat = { country: string; mapName: string; count: number; percentage: number };
export type CityStat = { city: string; country: string; count: number; percentage: number };

export type GeoDistribution = {
  total: number;
  countries: CountryStat[];
  cities: CityStat[];
};
