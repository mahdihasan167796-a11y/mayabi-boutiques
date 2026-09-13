import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSms } from "@/lib/sms";
import { formatBDT } from "@/lib/utils";

export const dynamic = "force-dynamic";

// GET — Vercel Cron এই এন্ডপয়েন্টে দিনে একবার হিট করবে (vercel.json দেখুন — Hobby প্ল্যানে
// দিনে একবারের বেশি cron চালানো যায় না)। কমপক্ষে ২ ঘণ্টা আগে আপডেট হওয়া, ৭ দিনের মধ্যে,
// এখনো রিমাইন্ড করা হয়নি, অর্ডারে রূপান্তরিত হয়নি এমন কার্টগুলো খুঁজে একবার করে SMS পাঠায়।
export async function GET(request: Request) {
  // Vercel নিজে থেকেই CRON_SECRET সেট থাকলে "Authorization: Bearer <secret>" হেডার পাঠায় —
  // এটা যাচাই করা হচ্ছে যাতে বাইরের কেউ এই এন্ডপয়েন্ট নিজে থেকে কল করে বারবার SMS পাঠাতে না পারে।
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = Date.now();
    const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabaseAdmin
      .from("abandoned_carts")
      .select("*")
      .eq("converted", false)
      .is("reminded_at", null)
      .lte("updated_at", twoHoursAgo)
      .gte("updated_at", sevenDaysAgo);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    let sent = 0;
    for (const cart of carts || []) {
      const itemNames = Array.isArray(cart.items)
        ? cart.items.map((it: any) => it.name).slice(0, 2).join(", ")
        : "আপনার পছন্দের পণ্য";

      const message = `প্রিয় ${cart.customer_name || "গ্রাহক"}, আপনার কার্টে ${itemNames} এখনো অপেক্ষা করছে! (সর্বমোট ${formatBDT(
        Number(cart.subtotal || 0)
      )})। এখনই অর্ডার সম্পন্ন করুন — মায়াবী বুটিকস। 💛`;

      const result = await sendSms(cart.phone, message);
      if (result.ok) {
        sent += 1;
        await supabaseAdmin
          .from("abandoned_carts")
          .update({ reminded_at: new Date().toISOString() })
          .eq("id", cart.id);
      }
    }

    return NextResponse.json({ ok: true, checked: carts?.length || 0, sent });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
