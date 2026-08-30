import { NextResponse } from "next/server";

import { verifySession } from "@/lib/dal";
import { getRecentActivity } from "@/lib/notifications";

export async function GET() {
  const session = await verifySession();
  const items = await getRecentActivity(session.companyId);
  return NextResponse.json({ items });
}
