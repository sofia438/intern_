import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/dal";
import { searchCities } from "@/lib/geo";

export async function GET(request: NextRequest) {
  await verifySession();

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim();
  const country = searchParams.get("country");

  if (!q || q.length < 2 || !country) {
    return NextResponse.json({ cities: [] });
  }

  const cities = await searchCities(q, country);
  return NextResponse.json({ cities });
}
