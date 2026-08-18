import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/dal";
import { suggestRelatedIndustries } from "@/lib/leadfinder/groq";

export async function POST(request: NextRequest) {
  await verifySession();

  const body = await request.json();
  const productName = typeof body.productName === "string" ? body.productName.trim() : "";

  if (!productName) {
    return NextResponse.json({ error: "Product name is required" }, { status: 400 });
  }

  const industries = await suggestRelatedIndustries({
    productName,
    oemNumber: typeof body.oemNumber === "string" ? body.oemNumber : undefined,
    hsCode: typeof body.hsCode === "string" ? body.hsCode : undefined,
    imageDescription: typeof body.imageDescription === "string" ? body.imageDescription : undefined,
  });

  return NextResponse.json({ industries });
}
