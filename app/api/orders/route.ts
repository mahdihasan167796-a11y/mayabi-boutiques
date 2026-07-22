import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          product_id: body.product_id || null,
          product_name: body.product_name || null,
          category_slug: body.category_slug || null,
          color: body.color || null,
          size: body.size || null,
          quantity: body.quantity || 1,
          unit_price: body.unit_price || 0,
          total_price: body.total_price || 0,
          customer_name: body.customer_name || "",
          phone: body.phone || "",
          region: body.region || null,
          city: body.city || null,
          area: body.area || null,
          address: body.address || "",
          address_label: body.address_label || null,
          payment_method: body.payment_method || "COD",
          transaction_id: body.transaction_id || null,
          status: "pending",
        },
      ])
      .select();

    if (error) {
      console.error("Order Insert Error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, order: data[0] });
  } catch (err) {
    console.error("Order API Exception:", err);
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}