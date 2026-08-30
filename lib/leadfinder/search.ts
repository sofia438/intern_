export type SearchCandidate = {
  title: string;
  link: string;
  snippet: string;
};

export type SearchEngine = "google" | "bing" | "yandex";


const YANDEX_DOMAIN_BY_COUNTRY: Record<string, string> = {
  RU: "yandex.ru",
  TR: "yandex.com.tr",
  KZ: "yandex.kz",
  BY: "yandex.by",
  UA: "yandex.ua",
};

async function searchGoogleViaSerper(query: string, countryCode: string): Promise<SearchCandidate[]> {
  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      gl: countryCode.toLowerCase(),
      num: 10,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return [];

  const data = await response.json();
  if (!Array.isArray(data.organic)) return [];

  return data.organic
    .filter((item: unknown): item is { title: string; link: string; snippet?: string } =>
      typeof item === "object" && item !== null && typeof (item as { link?: unknown }).link === "string"
    )
    .map((item: { title: string; link: string; snippet?: string }) => ({
      title: item.title ?? "",
      link: item.link,
      snippet: item.snippet ?? "",
    }));
}

async function searchViaSerpApi(
  query: string,
  countryCode: string,
  engine: "bing" | "yandex"
): Promise<SearchCandidate[]> {
  const url = new URL("https://serpapi.com/search");
  url.searchParams.set("engine", engine);
  url.searchParams.set("api_key", process.env.SERPAPI_API_KEY ?? "");

  if (engine === "bing") {
    url.searchParams.set("q", query);
    url.searchParams.set("cc", countryCode.toUpperCase());
  } else {
    url.searchParams.set("text", query);
    url.searchParams.set("yandex_domain", YANDEX_DOMAIN_BY_COUNTRY[countryCode.toUpperCase()] ?? "yandex.com");
  }

  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
  if (!response.ok) return [];

  const data = await response.json();
  if (!Array.isArray(data.organic_results)) return [];

  return data.organic_results
    .filter((item: unknown): item is { title: string; link: string; snippet?: string } =>
      typeof item === "object" && item !== null && typeof (item as { link?: unknown }).link === "string"
    )
    .map((item: { title: string; link: string; snippet?: string }) => ({
      title: item.title ?? "",
      link: item.link,
      snippet: item.snippet ?? "",
    }));
}

export async function searchCompanies(
  query: string,
  countryCode: string,
  engine: SearchEngine = "google"
): Promise<SearchCandidate[]> {
  try {
    if (engine === "google") {
      return await searchGoogleViaSerper(query, countryCode);
    }
    return await searchViaSerpApi(query, countryCode, engine);
  } catch {
    return [];
  }
}
