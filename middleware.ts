import { NextRequest, NextResponse } from "next/server";

// Routes that require the master password
const PROTECTED_PATHS = ["/analyzer", "/case-tools", "/lawyers"];

const COOKIE_NAME = "cyfsa_access";
const UNLOCK_PATH = "/unlock";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect specified paths
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Check for valid access cookie
  const accessCookie = request.cookies.get(COOKIE_NAME);
  if (accessCookie?.value === "granted") {
    return NextResponse.next();
  }

  // Redirect to unlock page, preserving intended destination
  const unlockUrl = request.nextUrl.clone();
  unlockUrl.pathname = UNLOCK_PATH;
  unlockUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(unlockUrl);
}

export const config = {
  matcher: ["/analyzer/:path*", "/case-tools/:path*", "/lawyers/:path*"],
};
