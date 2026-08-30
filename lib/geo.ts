import { countryName } from "@/lib/leadfinder/countries";

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}

export async function lookupIp(ip: string): Promise<{
  country: string | null;
  city: string | null;
  organization: string | null;
}> {
  try {
    const response = await fetch(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
    if (!response.ok) return { country: null, city: null, organization: null };

    const data = await response.json();

    let country: string | null = null;
    if (typeof data.country === "string" && data.country) {
      try {
        country = regionNames.of(data.country) ?? data.country;
      } catch {
        country = data.country;
      }
    }

    const organization = typeof data.org === "string" ? data.org.replace(/^AS\d+\s+/, "") : null;

    return {
      country,
      city: typeof data.city === "string" ? data.city : null,
      organization: organization || null,
    };
  } catch {
    return { country: null, city: null, organization: null };
  }
}

export async function geocodeCity(city: string, countryCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("city", city);
    url.searchParams.set("countrycodes", countryCode.toLowerCase());
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": `GlobalExpo/1.0 (${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"})`,
      },
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}

export async function geocodeCountry(countryCode: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("country", countryName(countryCode));
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": `GlobalExpo/1.0 (${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"})`,
      },
    });
    if (!response.ok) return null;

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    return null;
  }
}


export async function searchCities(query: string, countryCode: string): Promise<string[]> {
  try {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", query);
    url.searchParams.set("lang", "en");
    url.searchParams.set("limit", "20");
    url.searchParams.append("osm_tag", "place:city");
    url.searchParams.append("osm_tag", "place:town");
    url.searchParams.append("osm_tag", "place:village");

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data.features)) return [];

    const names: string[] = data.features
      .filter(
        (f: { properties?: { countrycode?: string; name?: string } }) =>
          f.properties?.countrycode === countryCode.toUpperCase() && typeof f.properties?.name === "string"
      )
      .map((f: { properties: { name: string } }) => f.properties.name);

    return Array.from(new Set(names)).slice(0, 8);
  } catch {
    return [];
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<{
  country: string | null;
  city: string | null;
}> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": `GlobalExpo/1.0 (${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"})`,
        },
      }
    );
    if (!response.ok) return { country: null, city: null };

    const data = await response.json();
    const address = data.address ?? {};

    return {
      country: typeof address.country === "string" ? address.country : null,
      city: typeof (address.city ?? address.town ?? address.village) === "string"
        ? address.city ?? address.town ?? address.village
        : null,
    };
  } catch {
    return { country: null, city: null };
  }
}
