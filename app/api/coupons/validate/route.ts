import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// চেকআউট পেজে "প্রয়োগ করুন" বাটনের জন্য — অর্ডার তৈরি না করেই কুপন যাচাই করে ছাড়ের প্রিভিউ দেখায়।
// চূড়ান্ত সাবমিটের সময় /api/orders আবার নিজে থেকে যাচাই করবে, তাই এখানে ভুল হলেও অর্ডার নিরাপদ থাকবে।
export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== "number") {
      return NextResponse.json({ ok: false, error: "কোড ও সাবটোটাল আবশ্যক" }, { status: 400 });
    }

    const normalizedCode = String(code).trim().toUpperCase();

    const { data: coupon } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (!coupon || !coupon.is_active) {
      return NextResponse.json({ ok: false, error: "কুপন কোডটি সঠিক নয় বা বন্ধ আছে।" }, { status: 400 });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ ok: false, error: "কুপনের মেয়াদ শেষ হয়ে গেছে।" }, { status: 400 });
    }
    if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.times_used >= coupon.usage_limit) {
      return NextResponse.json({ ok: false, error: "কুপনটির ব্যবহারসীমা শেষ হয়ে গেছে।" }, { status: 400 });
    }
    if (subtotal < Number(coupon.min_order_amount || 0)) {
      return NextResponse.json(
        { ok: false, error: `এই কুপন ব্যবহার করতে ন্যূনতম ৳${coupon.min_order_amount} টাকার অর্ডার লাগবে।` },
        { status: 400 }
      );
    }

    const discount =
      coupon.discount_type === "percentage"
        ? (subtotal * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);

    return NextResponse.json({ ok: true, code: coupon.code, discount: Math.min(discount, subtotal) });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}
