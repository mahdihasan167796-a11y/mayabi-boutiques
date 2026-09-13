import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { initiateSslcommerzPayment, isSslcommerzConfigured } from "@/lib/sslcommerz";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSslcommerzConfigured()) {
    return NextResponse.json(
      { ok: false, error: "কার্ড পেমেন্ট এখনো সক্রিয় করা হয়নি — SSLCommerz মার্চেন্ট ক্রেডেনশিয়াল যোগ করা হয়নি।" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();

    const items = Array.isArray(body.items) && body.items.length > 0 ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ ok: false, error: "কার্ট খালি" }, { status: 400 });
    }

    const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.unit_price) * Number(it.quantity), 0);
    const discount_amount = Number(body.discount_amount || 0);
    const total_price = Math.max(0, subtotal - discount_amount);

    // ১. অর্ডার "pending" স্ট্যাটাসে তৈরি করা — পেমেন্ট কনফার্ম হলেই status আপডেট হবে
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name: body.customer_name,
          phone: body.phone,
          email: body.email || null,
          address: body.address,
          region: body.region || null,
          city: body.city || null,
          area: body.area || null,
          subtotal,
          discount_amount,
          coupon_code: body.coupon_code || null,
          total_price,
          product_id: items[0]?.product_id ? String(items[0].product_id) : null,
          product_name: items.length === 1 ? items[0].product_name : `${items.length}টি প্রোডাক্ট`,
          color: items.length === 1 ? items[0].color || null : null,
          size: items.length === 1 ? items[0].size || null : null,
          quantity: items.reduce((s: number, it: any) => s + Number(it.quantity), 0),
          unit_price: items.length === 1 ? items[0].unit_price : null,
          payment_method: "sslcommerz",
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError || !newOrder) {
      return NextResponse.json({ ok: false, error: orderError?.message || "অর্ডার তৈরি করা যায়নি" }, { status: 500 });
    }

    const itemRows = items.map((it: any) => ({
      order_id: newOrder.id,
      product_id: String(it.product_id || ""),
      product_name: it.product_name,
      category_slug: it.category_slug || null,
      image: it.image || null,
      color: it.color || null,
      size: it.size || null,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      subtotal: Number(it.unit_price) * Number(it.quantity),
    }));
    await supabaseAdmin.from("order_items").insert(itemRows);

    // ২. SSLCommerz সেশন শুরু করা
    const siteUrl = `https://${req.headers.get("host")}`;
    const { gatewayUrl } = await initiateSslcommerzPayment({
      orderId: newOrder.id,
      amount: total_price,
      customerName: body.customer_name,
      customerEmail: body.email || "",
      customerPhone: body.phone,
      customerAddress: body.address || "",
      siteUrl,
    });

    return NextResponse.json({ ok: true, gatewayUrl });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
