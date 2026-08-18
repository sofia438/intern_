import worldCountries from "world-countries";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

// Continent/region -> ISO 3166-1 alpha-2 codes, sourced from the `world-countries`
// package (curated static data, not something Intl can derive on its own).
// These same alpha-2 codes double as Serper's `gl` param, so this file remains
// the single source of truth for the UI's country list, the language lookup,
// and search geo-targeting.
// "Antarctic" covers a handful of uninhabited/near-uninhabited ISO territories
// (Antarctica itself, Bouvet Island, French Southern & Antarctic Lands, Heard &
// McDonald Islands, South Georgia) — kept in a bucket of their own rather than
// dropped, so the country list is genuinely complete.
const CONTINENTS = ["Africa", "Americas", "Asia", "Europe", "Oceania", "Antarctic"] as const;
export type Continent = (typeof CONTINENTS)[number];

export type CountryOption = { code: string; name: string };

export const COUNTRIES_BY_CONTINENT: Record<Continent, CountryOption[]> = (() => {
  const grouped: Record<Continent, CountryOption[]> = {
    Africa: [],
    Americas: [],
    Asia: [],
    Europe: [],
    Oceania: [],
    Antarctic: [],
  };

  for (const country of worldCountries) {
    const continent = country.region as Continent;
    if (!CONTINENTS.includes(continent)) continue;

    const code = country.cca2;
    grouped[continent].push({ code, name: regionNames.of(code) ?? country.name.common });
  }

  for (const continent of CONTINENTS) {
    grouped[continent].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
})();

export const SUPPORTED_COUNTRIES = CONTINENTS.flatMap((continent) => COUNTRIES_BY_CONTINENT[continent]);

// Country -> ccTLD (e.g. DE -> ".de"), also sourced from `world-countries`.
// Used to scope one extra `site:<tld>` search per country so results aren't
// just geo-ranked but actually include the country's own domain space.
export const COUNTRY_TLD: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const country of worldCountries) {
    if (country.tld?.[0]) map[country.cca2] = country.tld[0];
  }
  return map;
})();

export function countryTld(code: string): string | null {
  return COUNTRY_TLD[code] ?? null;
}

// Business language per country, used to translate search queries for wider
// coverage. Countries not listed here fall back to English in
// countryLanguage() below — a safe degrade, not a hard failure.
export const COUNTRY_LANGUAGE: Record<string, string> = {
  DE: "German",
  FR: "French",
  IT: "Italian",
  ES: "Spanish",
  NL: "Dutch",
  PL: "Polish",
  RU: "Russian",
  TR: "Turkish",
  GB: "English",
  US: "English",
  CA: "English",
  MX: "Spanish",
  BR: "Portuguese",
  CN: "Chinese (Simplified)",
  JP: "Japanese",
  KR: "Korean",
  IN: "English",
  AE: "Arabic",
  SA: "Arabic",
  EG: "Arabic",
  ZA: "English",
  AU: "English",
  SE: "Swedish",
  NO: "Norwegian",
  FI: "Finnish",
  DK: "Danish",
  PT: "Portuguese",
  GR: "Greek",
  CZ: "Czech",
  RO: "Romanian",
  UA: "Ukrainian",
  VN: "Vietnamese",
  TH: "Thai",
  ID: "Indonesian",
  MY: "Malay",
};

export function countryName(code: string): string {
  return regionNames.of(code) ?? code;
}

export function countryLanguage(code: string): string {
  return COUNTRY_LANGUAGE[code] ?? "English";
}
