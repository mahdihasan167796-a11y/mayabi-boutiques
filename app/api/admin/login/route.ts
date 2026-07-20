import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, sha256Hex } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "অবৈধ রিকোয়েস্ট" }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { ok: false, error: "সার্ভারে ADMIN_PASSWORD সেট করা নেই। .env.local দেখুন।" },
      { status: 500 }
    );
  }

  if (!body.password || body.password !== adminPassword) {
    return NextResponse.json({ ok: false, error: "পাসওয়ার্ড সঠিক নয়।" }, { status: 401 });
  }

  const sessionValue = await sha256Hex(adminPassword);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // ৭ দিন
  });
  return res;
}
