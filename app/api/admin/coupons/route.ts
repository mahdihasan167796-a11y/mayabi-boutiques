import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET — সব কুপন লিস্ট করে (নতুন তৈরি হওয়া কুপন আগে দেখাবে)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, coupons: data });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}

// POST — নতুন কুপন তৈরি করে
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ ok: false, error: "কুপন কোড আবশ্যক" }, { status: 400 });
    }
    if (!body.discount_value || Number(body.discount_value) <= 0) {
      return NextResponse.json({ ok: false, error: "সঠিক ছাড়ের পরিমাণ দিন" }, { status: 400 });
    }
    if (body.discount_type === "percentage" && Number(body.discount_value) > 100) {
      return NextResponse.json({ ok: false, error: "শতাংশ ছাড় ১০০-এর বেশি হতে পারবে না" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("coupons")
      .insert([
        {
          code,
          discount_type: body.discount_type === "fixed" ? "fixed" : "percentage",
          discount_value: Number(body.discount_value),
          min_order_amount: body.min_order_amount ? Number(body.min_order_amount) : 0,
          usage_limit: body.usage_limit ? Number(body.usage_limit) : null,
          expires_at: body.expires_at || null,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      const message = error.message.includes("duplicate") ? "এই কোডটি আগে থেকেই আছে, অন্য কোড দিন।" : error.message;
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, coupon: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
