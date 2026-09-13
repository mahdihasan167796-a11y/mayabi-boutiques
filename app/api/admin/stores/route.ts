import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("store_locations").select("*").order("created_at", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name || !body.address) {
    return NextResponse.json({ ok: false, error: "নাম ও ঠিকানা আবশ্যক" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("store_locations")
    .insert([{ name: body.name, address: body.address, phone: body.phone || "", map_link: body.map_link || "" }])
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
