import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ১. আপনার আগের GET ফাংশন (CRM কাস্টমার লিস্ট এবং অর্ডার ফেচ করার জন্য)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, orders: data });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}

// 🚨 ২. স্টক অটো-ডিক্রিমেন্ট সহ নতুন POST ফাংশন (অর্ডার তৈরি করার সময়)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer_name, phone, address, items, total_amount } = body;

    // ক) স্টক ভ্যালিডেশন ও স্টক বিয়োগ করার লজিক
    if (items && Array.isArray(items)) {
      for (const item of items) {
        // প্রোডাক্টের বর্তমান তথ্য নিয়ে আসা
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("stock, variants")
          .eq("id", item.product_id || item.id)
          .single();

        if (product) {
          const qtyToDeduct = Number(item.quantity || 1);

          // যদি ভ্যারিয়েন্ট (সাইজ/কালার) থাকে
          if (product.variants && Array.isArray(product.variants) && item.variant_id) {
            const updatedVariants = product.variants.map((v: any) => {
              if (v.id === item.variant_id || v.size === item.size) {
                const currentStock = Number(v.stock) || 0;
                return { ...v, stock: Math.max(0, currentStock - qtyToDeduct) };
              }
              return v;
            });

            await supabaseAdmin
              .from("products")
              .update({ variants: updatedVariants })
              .eq("id", item.product_id || item.id);
          } 
          // সাধারণ স্টক কমানো
          else if (product.stock !== undefined && product.stock !== null) {
            const currentStock = Number(product.stock) || 0;
            const newStock = Math.max(0, currentStock - qtyToDeduct);

            await supabaseAdmin
              .from("products")
              .update({ stock: newStock })
              .eq("id", item.product_id || item.id);
          }
        }
      }
    }

    // খ) ডাটাবেজে অর্ডার সেভ করা
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name,
          phone,
          address,
          items,
          total_amount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ ok: false, error: orderError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}