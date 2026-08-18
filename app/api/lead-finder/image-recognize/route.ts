import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifySession } from "@/lib/dal";
import { describeImage } from "@/lib/leadfinder/groq";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  await verifySession();

  const formData = await request.formData();
  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  if (file.size > MAX_IMAGE_BYTES || !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  const description = await describeImage(dataUrl);

  return NextResponse.json({ description });
}
