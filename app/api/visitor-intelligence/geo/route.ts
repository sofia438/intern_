import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/dal";
import { getGeographicDistribution, isGeoRange } from "@/lib/visitorIntelligence";

export async function GET(request: NextRequest) {
  const session = await verifySession();

  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get("range") ?? "30d";
  const range = isGeoRange(rangeParam) ? rangeParam : "30d";
  const country = searchParams.get("country") ?? undefined;

  const data = await getGeographicDistribution(session.companyId, range, country);

  return NextResponse.json(data);
}
