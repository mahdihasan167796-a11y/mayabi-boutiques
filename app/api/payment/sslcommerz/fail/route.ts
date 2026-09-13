import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const siteUrl = `https://${req.headers.get("host")}`;
  try {
    const formData = await req.formData();
    const tran_id = String(formData.get("tran_id") || "");
    if (tran_id) {
      await supabaseAdmin.from("orders").update({ status: "cancelled" }).eq("id", tran_id);
    }
  } catch (error) {
    console.error("SSLCommerz fail handler error:", error);
  }
  return NextResponse.redirect(`${siteUrl}/checkout?payment=failed`);
}
