import { NextResponse } from "next/server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const session = await verifySession();
  const { productId } = await params;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.companyId !== session.companyId || !product.image) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(new Uint8Array(product.image), {
    headers: {
      "Content-Type": product.imageType || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
