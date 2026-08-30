import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/dal";
import { searchLeads } from "@/lib/globalSearch";

export async function GET(request: NextRequest) {
  const session = await verifySession();

  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchLeads(session.companyId, query);

  return NextResponse.json({ results });
}
