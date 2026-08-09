import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ১. GET ফাংশন
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

// ২. POST ফাংশন (প্রোডাক্ট ভ্যালিডেশন ছাড়াই অর্ডার সেভ হবে)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customer_name = body.customer_name || body.customerName || body.fullName || "";
    const phone = body.phone || body.phoneNumber || "";
    const address = body.address || "";
    const total_amount = body.total_price || body.total_amount || 0;

    let orderItems: any[] = [];
    if (body.items && Array.isArray(body.items)) {
      orderItems = body.items;
    } else {
      orderItems = [body];
    }

    // ব্যাকগ্রাউন্ডে স্টক কমানোর চেষ্টা (এরর আসলেও অর্ডার আটকাবে না)
    try {
      const item = orderItems[0];
      const targetId = item?.product_id || item?.id;
      if (targetId) {
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("*")
          .eq("id", targetId)
          .maybeSingle();

        if (product && product.stock) {
          const qty = Number(item.quantity || 1);
          await supabaseAdmin
            .from("products")
            .update({ stock: Math.max(0, Number(product.stock) - qty) })
            .eq("id", product.id);
        }
      }
    } catch (e) {
      console.log("Stock update bypassed:", e);
    }

    // সরাসরি ডাটাবেজে অর্ডার ইনসার্ট
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

    // অটোমেটিক SMS পাঠানো
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
            message: `সম্মানিত ${customer_name || "গ্রাহক"},\nমায়াবী বুটিকস-এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।\n\nঅর্ডার আইডি: #${orderIdShort}\nসর্বমোট: ৳${total_amount || 0}\n\nআমাদের সাথে থাকার জন্য ধন্যবাদ!`,
          }),
        });
      } catch (smsErr) {
        console.error("SMS error:", smsErr);
      }
    }

    return NextResponse.json({ ok: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}