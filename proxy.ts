import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { decrypt } from "@/lib/session";

// app/(dashboard)/* route-group pages resolve to bare paths (e.g. /dashboard, /settings),
// not a /dashboard/* prefix, so each protected route must be listed explicitly.
const protectedPaths = [
  "/dashboard",
  "/visitor-intelligence",
  "/lead-finder",
  "/image-search",
  "/maps-search",
  "/trade-databases",
  "/contact-finder",
  "/email-campaigns",
  "/reports",
  "/billing",
  "/admin",
  "/settings",
  "/profile",
  "/leads",
];

const authPaths = ["/login", "/register", "/forgot-password"];

function matches(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (matches(pathname, protectedPaths) && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (matches(pathname, authPaths) && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
