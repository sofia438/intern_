"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getClientIp, lookupIp, reverseGeocode } from "@/lib/geo";

function isValidCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export async function saveUserLocationFromCoords(lat: number, lng: number) {
  const session = await verifySession();

  if (!isValidCoord(lat, lng)) {
    await prisma.user.update({
      where: { id: session.userId },
      data: { locationCapturedAt: new Date() },
    });
    return;
  }

  const geo = await reverseGeocode(lat, lng);

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      locationCountry: geo.country,
      locationCity: geo.city,
      latitude: lat,
      longitude: lng,
      locationPermission: true,
      locationCapturedAt: new Date(),
    },
  });
}

export async function saveUserLocationFromIp() {
  const session = await verifySession();

  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const ipInfo = ip
    ? await lookupIp(ip)
    : { country: null as string | null, city: null as string | null, organization: null as string | null };

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      locationCountry: ipInfo.country,
      locationCity: ipInfo.city,
      organization: ipInfo.organization,
      locationPermission: false,
      locationCapturedAt: new Date(),
    },
  });
}
