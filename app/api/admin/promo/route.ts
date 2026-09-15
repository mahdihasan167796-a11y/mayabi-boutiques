import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { data, error } = await supabaseAdmin.from("promo_sections").select("*").order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.title) {
      return NextResponse.json({ ok: false, error: "শিরোনাম আবশ্যক" }, { status: 400 });
    }

    const { data: maxRow } = await supabaseAdmin
      .from("promo_sections")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await supabaseAdmin
      .from("promo_sections")
      .insert([
        {
          title: body.title,
          subtitle: body.subtitle || "",
          image: body.image || "",
          cta_label: body.cta_label || "কালেকশন দেখুন",
          cta_link: body.cta_link || "/",
          placement: body.placement === "hero" ? "hero" : "mid",
          media_type: body.media_type === "video" ? "video" : "image",
          sort_order: (maxRow?.sort_order ?? 0) + 1,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, item: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
