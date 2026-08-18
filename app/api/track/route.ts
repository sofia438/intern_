import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getClientIp, lookupIp, reverseGeocode } from "@/lib/geo";
import { parseUserAgent } from "@/lib/ua";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

type TrackPayload = {
  siteId?: string;
  visitorCookie?: string;
  locationPermission?: boolean;
  coords?: { lat: number; lng: number };
};

export async function POST(request: NextRequest) {
  let payload: TrackPayload;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const { siteId, visitorCookie, locationPermission, coords } = payload;

  if (!siteId || !visitorCookie) {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const company = await prisma.company.findUnique({ where: { id: siteId } });
  if (!company) {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  const ip = getClientIp(request.headers);
  const ipInfo = ip
    ? await lookupIp(ip)
    : { country: null as string | null, city: null as string | null, organization: null as string | null };

  let country = ipInfo.country;
  let city = ipInfo.city;
  let latitude: number | null = null;
  let longitude: number | null = null;

  if (locationPermission && coords && typeof coords.lat === "number" && typeof coords.lng === "number") {
    latitude = coords.lat;
    longitude = coords.lng;
    const geo = await reverseGeocode(coords.lat, coords.lng);
    if (geo.country) country = geo.country;
    if (geo.city) city = geo.city;
  }

  const { browser, operatingSystem, deviceType } = parseUserAgent(request.headers.get("user-agent"));
  const organization = ipInfo.organization;

  await prisma.websiteVisitor.upsert({
    where: { companyId_visitorCookie: { companyId: siteId, visitorCookie } },
    create: {
      companyId: siteId,
      visitorCookie,
      ipAddress: ip,
      country,
      city,
      organization,
      browser,
      operatingSystem,
      deviceType,
      latitude,
      longitude,
      locationPermission: locationPermission ?? null,
      visitCount: 1,
    },
    update: {
      ...(ip && { ipAddress: ip }),
      ...(country && { country }),
      ...(city && { city }),
      ...(organization && { organization }),
      ...(browser && { browser }),
      ...(operatingSystem && { operatingSystem }),
      ...(deviceType && { deviceType }),
      ...(latitude !== null && { latitude }),
      ...(longitude !== null && { longitude }),
      ...(locationPermission !== undefined && { locationPermission }),
      visitCount: { increment: 1 },
    },
  });

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
