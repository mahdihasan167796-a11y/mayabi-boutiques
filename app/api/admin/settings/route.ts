import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    isOfferActive?: boolean;
    noOfferMessage?: string;
    combo1Title?: string;
    combo1Price?: string;
    combo1OldPrice?: string;
    combo1Features?: string;
    combo2Title?: string;
    combo2Price?: string;
    combo2OldPrice?: string;
    combo2Features?: string;
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
      is_offer_active: body.isOfferActive ?? true,
      no_offer_message: body.noOfferMessage ?? "",
      combo1_title: body.combo1Title ?? "",
      combo1_price: body.combo1Price ?? "",
      combo1_old_price: body.combo1OldPrice ?? "",
      combo1_features: body.combo1Features ?? "",
      combo2_title: body.combo2Title ?? "",
      combo2_price: body.combo2Price ?? "",
      combo2_old_price: body.combo2OldPrice ?? "",
      combo2_features: body.combo2Features ?? "",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, settings: data });
}