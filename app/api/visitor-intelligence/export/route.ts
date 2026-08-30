import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await verifySession();

  const visitors = await prisma.websiteVisitor.findMany({
    where: { companyId: session.companyId },
    orderBy: { lastVisit: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Visitors");

  sheet.columns = [
    { header: "Company", key: "company", width: 30 },
    { header: "Country", key: "country", width: 20 },
    { header: "City", key: "city", width: 20 },
    { header: "Device", key: "device", width: 14 },
    { header: "Browser", key: "browser", width: 16 },
    { header: "Operating System", key: "os", width: 18 },
    { header: "Last Visit", key: "lastVisit", width: 22 },
    { header: "Visit Count", key: "visitCount", width: 14 },
  ];

  for (const visitor of visitors) {
    sheet.addRow({
      company: visitor.organization ?? "Unknown",
      country: visitor.country ?? "",
      city: visitor.city ?? "",
      device: visitor.deviceType ?? "",
      browser: visitor.browser ?? "",
      os: visitor.operatingSystem ?? "",
      lastVisit: visitor.lastVisit.toISOString(),
      visitCount: visitor.visitCount,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="visitor-intelligence.xlsx"`,
    },
  });
}
