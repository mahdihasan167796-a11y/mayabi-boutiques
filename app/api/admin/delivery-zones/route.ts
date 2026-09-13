import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin.from("delivery_zones").select("*").order("district_name", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.district_name) return NextResponse.json({ ok: false, error: "জেলার নাম আবশ্যক" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("delivery_zones")
    .insert([
      {
        district_name: body.district_name,
        estimated_days: body.estimated_days || "৩-৫ দিন",
        cod_available: body.cod_available ?? true,
      },
    ])
    .select()
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data }, { status: 201 });
}
