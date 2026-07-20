import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).single();
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, settings: data });
}

export async function PATCH(request: Request) {
  let body: {
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    messengerUrl?: string;
    phoneNumber?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "অবৈধ রিকোয়েস্ট" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .upsert({
      id: 1,
      facebook_url: body.facebookUrl ?? "",
      instagram_url: body.instagramUrl ?? "",
      tiktok_url: body.tiktokUrl ?? "",
      messenger_url: body.messengerUrl ?? "",
      phone_number: body.phoneNumber ?? "",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, settings: data });
}
