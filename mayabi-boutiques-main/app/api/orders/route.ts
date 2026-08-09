import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const productId = body.product_id;
    const requestedQuantity = Number(body.quantity) || 1;

    // ১. প্রোডাক্টের বর্তমান স্টক চেক করা (যদি product_id থাকে)
    if (productId) {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", productId)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { ok: false, error: "প্রোডাক্ট ডাটাবেজে পাওয়া যায়নি।" },
          { status: 404 }
        );
      }

      // স্টক পর্যাপ্ত না থাকলে অর্ডার ব্লক করা
      if (product.stock < requestedQuantity) {
        return NextResponse.json(
          { ok: false, error: "দুঃখিত, পণ্যটি স্টক আউট হয়ে গেছে বা পর্যাপ্ত স্টক নেই।" },
          { status: 400 }
        );
      }
    }

    // ২. অর্ডার ডাটাবেজে ইনসার্ট করা (আপনার মূল অবজেক্ট অনুযায়ী)
    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          product_id: body.product_id || null,
          product_name: body.product_name || null,
          category_slug: body.category_slug || null,
          color: body.color || null,
          size: body.size || null,
          quantity: requestedQuantity,
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

    // ৩. অর্ডার সফল হলে ডাটাবেজ থেকে অটোমেটিক স্টক কমিয়ে দেওয়া
    if (productId) {
      const { error: rpcError } = await supabase.rpc("decrement_product_stock", {
        product_id: productId,
        quantity_to_reduce: requestedQuantity,
      });

      if (rpcError) {
        console.error("Stock Decrement Error:", rpcError);
        // নোট: অর্ডার কিন্তু সফল হয়েছে, শুধু স্টক ডিক্রিমেন্টে সমস্যা হলে লগ করবে
      }
    }

    return NextResponse.json({ ok: true, order: data[0] });
  } catch (err) {
    console.error("Order API Exception:", err);
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}