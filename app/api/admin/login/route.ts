import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, sha256Hex } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD ?? "";

    if (!adminPassword) {
      return NextResponse.json(
        { ok: false, error: "সার্ভারে ADMIN_PASSWORD সেট করা নেই।" },
        { status: 500 }
      );
    }

    const expectedHash = await sha256Hex(adminPassword);
    const inputHash = await sha256Hex(String(password || ""));

    if (inputHash !== expectedHash) {
      return NextResponse.json({ ok: false, error: "পাসওয়ার্ড সঠিক নয়।" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, expectedHash, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "অবৈধ রিকোয়েস্ট।" }, { status: 400 });
  }
}
