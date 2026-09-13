import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateSslcommerzTransaction } from "@/lib/sslcommerz";
import { sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const siteUrl = `https://${req.headers.get("host")}`;

  try {
    const formData = await req.formData();
    const tran_id = String(formData.get("tran_id") || "");
    const val_id = String(formData.get("val_id") || "");

    if (!tran_id || !val_id) {
      return NextResponse.redirect(`${siteUrl}/checkout?payment=invalid`);
    }

    // কাস্টমারের ব্রাউজার থেকে আসা ডেটা সরাসরি বিশ্বাস না করে SSLCommerz-এর ভ্যালিডেশন API দিয়ে
    // নিশ্চিত হওয়া হচ্ছে যে পেমেন্টটা আসলেই সফল হয়েছে (টেম্পারিং ঠেকাতে জরুরি)
    const { isValid, data } = await validateSslcommerzTransaction(val_id);

    if (!isValid || data.tran_id !== tran_id) {
      return NextResponse.redirect(`${siteUrl}/checkout?payment=failed`);
    }

    const { data: order } = await supabaseAdmin
      .from("orders")
      .update({
        status: "confirmed",
        transaction_id: data.bank_tran_id || val_id,
      })
      .eq("id", tran_id)
      .select()
      .single();

    if (order?.phone) {
      const orderIdShort = String(order.id).slice(0, 6).toUpperCase();
      await sendSms(
        order.phone,
        `সম্মানিত ${order.customer_name || "গ্রাহক"},\nআপনার পেমেন্ট সফল হয়েছে! অর্ডার আইডি: #${orderIdShort}\nসর্বমোট: ৳${order.total_price}\n\nধন্যবাদ, মায়াবী বুটিকস।`
      );
    }

    return NextResponse.redirect(`${siteUrl}/checkout?payment=success&order=${tran_id}`);
  } catch (error) {
    console.error("SSLCommerz success handler error:", error);
    return NextResponse.redirect(`${siteUrl}/checkout?payment=error`);
  }
}
