import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — সব ক্যাটাগরি sort_order অনুযায়ী লিস্ট করে
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.from("categories").select("*").order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, categories: data });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}

// POST — নতুন ক্যাটাগরি তৈরি করে
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();

    if (!name) {
      return NextResponse.json({ ok: false, error: "ক্যাটাগরির নাম আবশ্যক" }, { status: 400 });
    }

    // নাম থেকে স্লাগ বানানো (দেওয়া না থাকলে)
    let slug = String(body.slug || "").trim();
    if (!slug) {
      slug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\u0980-\u09FF\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    }

    // বর্তমানে সর্বোচ্চ sort_order কত সেটা বের করে তার পরের নম্বর বসানো
    const { data: maxRow } = await supabaseAdmin
      .from("categories")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert([
        {
          slug,
          name,
          name_en: body.name_en || null,
          tag: body.tag || "",
          image: body.image || "",
          is_featured: body.is_featured ?? true,
          sort_order: body.sort_order ?? nextSortOrder,
        },
      ])
      .select()
      .single();

    if (error) {
      const message = error.message.includes("duplicate") ? "এই স্লাগের ক্যাটাগরি আগে থেকেই আছে।" : error.message;
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, category: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
