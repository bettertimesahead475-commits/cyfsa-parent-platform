import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "cyfsa_access";
// Cookie lasts 30 days
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const masterPassword = process.env.MASTER_PASSWORD;

    if (!masterPassword) {
      return NextResponse.json(
        { error: "Server misconfiguration — MASTER_PASSWORD not set." },
        { status: 500 }
      );
    }

    if (!password || password !== masterPassword) {
      // Small delay to slow brute-force attempts
      await new Promise((r) => setTimeout(r, 600));
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

// Logout — clear the access cookie
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
