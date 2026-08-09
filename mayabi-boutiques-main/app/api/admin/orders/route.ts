import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ১. GET ফাংশন (অর্ডার ফেচ করার জন্য)
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

// ২. POST ফাংশন (অর্ডার তৈরি এবং স্টক হ্যান্ডলিং)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ক) ফ্রন্টএন্ড থেকে অ্যারাই আকারে পাঠালেও ধরবে, সিঙ্গেল ডাটা পাঠালেও ধরবে
    const customer_name = body.customer_name || body.customerName || "";
    const phone = body.phone || body.phoneNumber || "";
    const address = body.address || "";
    const total_amount = body.total_price || body.total_amount || 0;

    // আইটেম ফরম্যাট এক্সেস করা (সিঙ্গেল আইটেমকে অ্যারাই করে নেওয়া)
    let orderItems: any[] = [];
    if (body.items && Array.isArray(body.items)) {
      orderItems = body.items;
    } else if (body.product_id || body.slug || body.id) {
      orderItems = [body];
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { ok: false, error: "প্রোডাক্ট ডাটা পাওয়া যায়নি।" },
        { status: 400 }
      );
    }

    // খ) স্টক ভ্যালিডেশন ও স্টক বিয়োগ করার লজিক (ID এবং SLUG উভয় সাপোর্ট সহ)
    for (const item of orderItems) {
      const targetId = item.product_id || item.id;
      const targetSlug = item.slug || item.product_slug;

      let product = null;

      // প্রথমে ID দিয়ে খোঁজা
      if (targetId) {
        const { data } = await supabaseAdmin
          .from("products")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();
        product = data;
      }

      // না পেলে SLUG দিয়ে খোঁজা
      if (!product && targetSlug) {
        const { data } = await supabaseAdmin
          .from("products")
          .select("*")
          .eq("slug", targetSlug)
          .maybeSingle();
        product = data;
      }

      // যদি প্রোডাক্টটি ডাটাবেজে একেবারেই না থাকে
      if (!product) {
        return NextResponse.json(
          { ok: false, error: "প্রোডাক্ট ডাটাবেজে পাওয়া যায়নি।" },
          { status: 400 }
        );
      }

      // স্টক কমানোর লজিক
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
          .eq("id", product.id);
      } 
      // সাধারণ স্টক কমানো
      else if (product.stock !== undefined && product.stock !== null) {
        const currentStock = Number(product.stock) || 0;
        const newStock = Math.max(0, currentStock - qtyToDeduct);

        await supabaseAdmin
          .from("products")
          .update({ stock: newStock })
          .eq("id", product.id);
      }
    }

    // গ) ডাটাবেজে অর্ডার সেভ করা
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name,
          phone,
          address,
          items: orderItems,
          total_amount,
          payment_method: body.payment_method || "cod",
          transaction_id: body.transaction_id || null,
          region: body.region || null,
          city: body.city || null,
          area: body.area || null,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ ok: false, error: orderError.message }, { status: 500 });
    }

    // ঘ) কাস্টমারকে অটোমেটিক SMS পাঠানো
    if (newOrder && phone) {
      try {
        const orderIdShort = String(newOrder.id || "").slice(0, 6).toUpperCase();
        const host = req.headers.get("host") || "";
        const protocol = host.includes("localhost") ? "http" : "https";

        await fetch(`${protocol}://${host}/api/admin/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone,
            message: `সম্মানিত ${customer_name || "গ্রাহক"},\nমায়াবী বুটিকস-এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।\n\nঅর্ডার আইডি: #${orderIdShort}\nসর্বমোট: ৳${total_amount || 0}\n\nদ্রুততম সময়ে আপনার অর্ডারটি প্রক্রিয়াজাত করা হবে। আমাদের সাথে থাকার জন্য ধন্যবাদ!`,
          }),
        });
      } catch (smsErr) {
        console.error("অটো SMS পাঠাতে সমস্যা হয়েছে:", smsErr);
      }
    }

    return NextResponse.json({ ok: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}