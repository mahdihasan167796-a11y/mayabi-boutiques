import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      return NextResponse.json({ ok: false, error: "সঠিক ইমেইল দিন।" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("newsletter_subscribers").insert([{ email: cleanEmail }]);

    if (error) {
      if (error.message.includes("duplicate")) {
        return NextResponse.json({ ok: true, alreadySubscribed: true });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}
