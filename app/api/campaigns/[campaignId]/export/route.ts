import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const session = await verifySession();
  const { campaignId } = await params;

  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
    include: { recipients: { orderBy: { createdAt: "asc" } } },
  });

  if (!campaign || campaign.companyId !== session.companyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Campaign Report");

  sheet.columns = [
    { header: "Company", key: "company", width: 30 },
    { header: "Email", key: "email", width: 30 },
    { header: "Sent Time", key: "sentTime", width: 20 },
    { header: "Status", key: "status", width: 16 },
  ];

  for (const recipient of campaign.recipients) {
    sheet.addRow({
      company: recipient.companyName ?? "",
      email: recipient.email,
      sentTime: recipient.sentAt ? new Date(recipient.sentAt).toLocaleString() : "",
      status: recipient.status,
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="campaign-${campaignId}.xlsx"`,
    },
  });
}
