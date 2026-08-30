import { VisitorPage } from "@/components/dashboard/DashboardScreens";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getGeographicDistribution } from "@/lib/visitorIntelligence";

export default async function Page() {
  const session = await verifySession();

  const [rows, initialGeo] = await Promise.all([
    prisma.websiteVisitor.findMany({
      where: { companyId: session.companyId },
      orderBy: { lastVisit: "desc" },
    }),
    getGeographicDistribution(session.companyId, "30d"),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const visitorsToday = rows.filter((row) => row.lastVisit >= startOfToday).length;
  const identifiedCompanies = new Set(rows.filter((row) => row.organization).map((row) => row.organization)).size;
  const countries = new Set(rows.filter((row) => row.country).map((row) => row.country)).size;
  const returnVisitors = rows.filter((row) => row.visitCount > 1).length;

  const visitors = rows.map((row) => ({
    organization: row.organization,
    country: row.country,
    city: row.city,
    deviceType: row.deviceType,
    lastVisit: row.lastVisit.toISOString(),
    visitCount: row.visitCount,
  }));

  return (
    <VisitorPage
      stats={{ visitorsToday, identifiedCompanies, countries, returnVisitors }}
      visitors={visitors}
      initialGeo={initialGeo}
    />
  );
}
