import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await verifySession();
  const { jobId } = await params;

  const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
  if (!job || job.companyId !== session.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const idsParam = new URL(request.url).searchParams.get("ids");
  const ids = idsParam ? idsParam.split(",").filter(Boolean) : null;

  const results = await prisma.searchResult.findMany({
    where: ids ? { searchJobId: jobId, id: { in: ids } } : { searchJobId: jobId },
    orderBy: { confidenceScore: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Results");

  if (job.searchType === "MAPS") {
    sheet.columns = [
      { header: "Company", key: "company", width: 30 },
      { header: "Category", key: "category", width: 22 },
      { header: "Address", key: "address", width: 35 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Website", key: "website", width: 30 },
      { header: "Opening Hours", key: "openingHours", width: 40 },
      { header: "Rating", key: "rating", width: 12 },
      { header: "Reviews", key: "reviews", width: 12 },
      { header: "Country", key: "country", width: 20 },
    ];

    for (const result of results) {
      sheet.addRow({
        company: result.companyName ?? "",
        category: result.category ?? "",
        address: result.address ?? "",
        phone: result.phone ?? "",
        email: result.email ?? "",
        website: result.website ?? "",
        openingHours: result.openingHours ?? "",
        rating: result.rating ?? "",
        reviews: result.reviewsCount ?? "",
        country: result.country ?? "",
      });
    }
  } else {
    sheet.columns = [
      { header: "Company", key: "company", width: 30 },
      { header: "Website", key: "website", width: 30 },
      { header: "Country", key: "country", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Contact Person", key: "contactName", width: 25 },
      { header: "Position", key: "contactTitle", width: 25 },
      { header: "Recommended Email", key: "contactEmail", width: 30 },
      { header: "Source Page", key: "contactSourcePage", width: 35 },
      { header: "Confidence", key: "contactConfidence", width: 14 },
    ];

    for (const result of results) {
      sheet.addRow({
        company: result.companyName ?? "",
        website: result.website ?? "",
        country: result.country ?? "",
        email: result.email ?? "",
        phone: result.phone ?? "",
        contactName: result.contactName ?? "",
        contactTitle: result.contactTitle ?? "",
        contactEmail: result.contactEmail ?? "",
        contactSourcePage: result.contactSourcePage ?? "",
        contactConfidence: result.contactConfidence != null ? `${Math.round(result.contactConfidence)}%` : "",
      });
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="lead-finder-${jobId}.xlsx"`,
    },
  });
}
