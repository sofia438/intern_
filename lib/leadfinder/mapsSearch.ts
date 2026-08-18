export type MapsCandidate = {
  title: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews: number | null;
  operatingHours: Record<string, string> | null;
  category: string | null;
  placeId: string | null;
};

export async function searchGoogleMaps(
  query: string,
  lat: number | null,
  lng: number | null,
  zoom: number
): Promise<MapsCandidate[]> {
  try {
    const url = new URL("https://serpapi.com/search");
    url.searchParams.set("engine", "google_maps");
    url.searchParams.set("api_key", process.env.SERPAPI_API_KEY ?? "");
    url.searchParams.set("q", query);

    if (lat !== null && lng !== null) {
      url.searchParams.set("ll", `@${lat},${lng},${zoom}z`);
    }

    const response = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data.local_results)) return [];

    return data.local_results
      .filter((item: unknown): item is { title: string } =>
        typeof item === "object" && item !== null && typeof (item as { title?: unknown }).title === "string"
      )
      .map(
        (item: {
          title: string;
          address?: string;
          phone?: string;
          website?: string;
          rating?: number;
          reviews?: number;
          operating_hours?: Record<string, string>;
          type?: string;
          place_id?: string;
        }) => ({
          title: item.title,
          address: item.address ?? null,
          phone: item.phone ?? null,
          website: item.website ?? null,
          rating: typeof item.rating === "number" ? item.rating : null,
          reviews: typeof item.reviews === "number" ? item.reviews : null,
          operatingHours: item.operating_hours ?? null,
          category: item.type ?? null,
          placeId: item.place_id ?? null,
        })
      );
  } catch {
    return [];
  }
}
