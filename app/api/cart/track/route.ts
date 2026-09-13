import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// POST — চেকআউট পেজে ফোন নাম্বার লেখা হলে (ডিবাউন্স করে) কার্টের একটা স্ন্যাপশট সেভ করে।
// একই ফোন নাম্বারে বারবার কল হলে সেটা আপডেট হয়ে যায় (নতুন রো তৈরি হয় না)।
export async function POST(request: Request) {
  try {
    const { phone, customer_name, items, subtotal } = await request.json();

    // খুব ছোট/অসম্পূর্ণ নাম্বারে ট্র্যাকিং শুরু করার দরকার নেই
    if (!phone || String(phone).replace(/\D/g, "").length < 11 || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { error } = await supabaseAdmin.from("abandoned_carts").upsert(
      [
        {
          phone,
          customer_name: customer_name || null,
          items,
          subtotal: Number(subtotal) || 0,
          updated_at: new Date().toISOString(),
          reminded_at: null,
          converted: false,
        },
      ],
      { onConflict: "phone" }
    );

    if (error) {
      console.error("Cart tracking error:", error);
      return NextResponse.json({ ok: false }, { status: 200 }); // ট্র্যাকিং ব্যর্থ হলেও কাস্টমারের চেকআউট আটকাবে না
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Cart tracking error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
