import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ১. GET ফাংশন (CRM কাস্টমার লিস্ট এবং অর্ডার ফেচ করার জন্য)
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

// ২. POST ফাংশন (অর্ডার তৈরি এবং সেফটি স্টক হ্যান্ডলিং)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // ক) ফ্রন্টএন্ড ডাটা প্রসেসিং
    const customer_name = body.customer_name || body.customerName || "";
    const phone = body.phone || body.phoneNumber || "";
    const address = body.address || "";
    const total_amount = body.total_price || body.total_amount || 0;

    let orderItems: any[] = [];
    if (body.items && Array.isArray(body.items)) {
      orderItems = body.items;
    } else if (body.product_id || body.slug || body.id || body.product_name) {
      orderItems = [body];
    }

    // খ) সেফটি স্টক এডজাস্টমেন্ট (প্রোডাক্ট না পেলেও এরর থ্রো করবে না)
    for (const item of orderItems) {
      try {
        const targetId = item.product_id || item.id;
        const rawSlug = item.slug || item.product_slug;
        let targetSlug = rawSlug ? String(rawSlug) : "";
        try {
          if (targetSlug) targetSlug = decodeURIComponent(targetSlug);
        } catch {}

        let product = null;

        // ID দিয়ে খোঁজার চেষ্টা
        if (targetId) {
          const { data } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("id", targetId)
            .maybeSingle();
          product = data;
        }

        // Decoded Slug দিয়ে চেষ্টা
        if (!product && targetSlug) {
          const { data } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("slug", targetSlug)
            .maybeSingle();
          product = data;
        }

        // Raw Slug দিয়ে চেষ্টা
        if (!product && rawSlug) {
          const { data } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("slug", rawSlug)
            .maybeSingle();
          product = data;
        }

        // প্রোডাক্ট ডাটাবেজে পাওয়া গেলে স্টক কমিয়ে দেবে
        if (product) {
          const qtyToDeduct = Number(item.quantity || 1);

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
          } else if (product.stock !== undefined && product.stock !== null) {
            const currentStock = Number(product.stock) || 0;
            const newStock = Math.max(0, currentStock - qtyToDeduct);

            await supabaseAdmin
              .from("products")
              .update({ stock: newStock })
              .eq("id", product.id);
          }
        }
      } catch (stockErr) {
        // স্টক আপডেটে কোনো এরর আসলেও অর্ডার সাবমিট বন্ধ হবে না
        console.error("Stock update skipped:", stockErr);
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