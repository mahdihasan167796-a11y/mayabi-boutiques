import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { validateSslcommerzTransaction } from "@/lib/sslcommerz";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const tran_id = String(formData.get("tran_id") || "");
    const val_id = String(formData.get("val_id") || "");
    const status = String(formData.get("status") || "");

    if (!tran_id) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    if (status !== "VALID" && status !== "VALIDATED") {
      // ব্যর্থ/বাতিল পেমেন্টের জন্য IPN — কিছু করার দরকার নেই, success/fail/cancel রুট আগে থেকেই সামলাচ্ছে
      return NextResponse.json({ ok: true });
    }

    const { isValid, data } = await validateSslcommerzTransaction(val_id);
    if (!isValid || data.tran_id !== tran_id) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // idempotent — একই অর্ডার একাধিকবার IPN পেলেও সমস্যা নেই, শুধু নিশ্চিত করা হচ্ছে স্ট্যাটাস confirmed আছে
    await supabaseAdmin
      .from("orders")
      .update({ status: "confirmed", transaction_id: data.bank_tran_id || val_id })
      .eq("id", tran_id)
      .eq("payment_method", "sslcommerz");

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SSLCommerz IPN error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
