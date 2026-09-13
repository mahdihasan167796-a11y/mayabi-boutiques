import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("instagram_showcase").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.image) return NextResponse.json({ ok: false, error: "ছবি আবশ্যক" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("instagram_showcase")
    .insert([{ image: body.image, post_link: body.post_link || null }])
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
