import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendCustomerOrderConfirmation } from "@/lib/email";
import { sendSms } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface IncomingItem {
  product_id: string;
  product_name: string;
  category_slug?: string;
  image?: string;
  color?: string;
  size?: string;
  quantity: number;
  unit_price: number;
}

// ১. GET — সব অর্ডার + প্রতিটার items সহ রিটার্ন করে (অ্যাডমিন ড্যাশবোর্ড ব্যবহার করে)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, orders: data });
  } catch {
    return NextResponse.json({ ok: false, error: "সার্ভার এরর" }, { status: 500 });
  }
}

// কুপন কোড যাচাই করে ছাড়ের পরিমাণ হিসাব করে
async function validateCoupon(rawCode: string, subtotal: number) {
  const code = rawCode.trim().toUpperCase();
  const { data: coupon } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!coupon || !coupon.is_active) {
    return { valid: false as const, error: "কুপন কোডটি সঠিক নয় বা বন্ধ আছে।" };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false as const, error: "কুপনের মেয়াদ শেষ হয়ে গেছে।" };
  }
  if (coupon.usage_limit !== null && coupon.usage_limit !== undefined && coupon.times_used >= coupon.usage_limit) {
    return { valid: false as const, error: "কুপনটির ব্যবহারসীমা শেষ হয়ে গেছে।" };
  }
  if (subtotal < Number(coupon.min_order_amount || 0)) {
    return {
      valid: false as const,
      error: `এই কুপন ব্যবহার করতে ন্যূনতম ৳${coupon.min_order_amount} টাকার অর্ডার লাগবে।`,
    };
  }

  const discount =
    coupon.discount_type === "percentage"
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);

  return { valid: true as const, coupon, discount: Math.min(discount, subtotal) };
}

// ২. POST — নতুন অর্ডার তৈরি করে (একাধিক প্রোডাক্টসহ, কুপনসহ)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customer_name = body.customer_name || body.customerName || body.fullName || "";
    const phone = body.phone || body.phoneNumber || "";
    const address = body.address || "";
    const email = body.email || body.customerEmail || "";
    const user_id = body.user_id || null;

    // পুরনো সিঙ্গেল-প্রোডাক্ট ফর্ম থেকেও কল হতে পারে, তাই items না থাকলে একটাই আইটেম ধরে নেওয়া হচ্ছে
    const rawItems: IncomingItem[] =
      Array.isArray(body.items) && body.items.length > 0
        ? body.items
        : [
            {
              product_id: body.product_id,
              product_name: body.product_name || "প্রোডাক্ট",
              category_slug: body.category_slug,
              image: body.image,
              color: body.color,
              size: body.size,
              quantity: Number(body.quantity || 1),
              unit_price: Number(body.unit_price || body.total_price || 0),
            },
          ];

    const subtotal = rawItems.reduce((sum, it) => sum + Number(it.unit_price) * Number(it.quantity), 0);

    let discount_amount = 0;
    let matchedCoupon: any = null;
    if (body.coupon_code) {
      const result = await validateCoupon(body.coupon_code, subtotal);
      if (!result.valid) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }
      discount_amount = result.discount;
      matchedCoupon = result.coupon;
    }

    const total_price = Math.max(0, subtotal - discount_amount);

    // ২.১ — orders টেবিলে মূল রো তৈরি
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name,
          phone,
          email: email || null,
          user_id,
          address,
          subtotal,
          discount_amount,
          coupon_code: matchedCoupon?.code || null,
          total_price,
          // পুরনো UI/রিপোর্ট এখনো একক-প্রোডাক্ট কলাম পড়ে, তাই প্রথম আইটেমের সারাংশ এখানেও রাখা হলো
          product_id: rawItems[0]?.product_id ? String(rawItems[0].product_id) : null,
          product_name:
            rawItems.length === 1 ? rawItems[0].product_name : `${rawItems.length}টি প্রোডাক্ট`,
          color: rawItems.length === 1 ? rawItems[0].color || null : null,
          size: rawItems.length === 1 ? rawItems[0].size || null : null,
          quantity: rawItems.reduce((s, it) => s + Number(it.quantity), 0),
          unit_price: rawItems.length === 1 ? rawItems[0].unit_price : null,
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

    // ২.২ — order_items ইনসার্ট করা
    const itemRows = rawItems.map((it) => ({
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

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(itemRows);
    if (itemsError) {
      // অর্ডার ততক্ষণে তৈরি হয়ে গেছে, তাই পুরো রিকোয়েস্ট ফেল না করিয়ে শুধু লগ রাখা হলো
      console.error("order_items insert error:", itemsError);
    }

    // ২.৩ — প্রতিটা প্রোডাক্টের স্টক কমানো
    for (const it of rawItems) {
      if (!it.product_id) continue;
      try {
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("stock")
          .eq("id", it.product_id)
          .maybeSingle();

        if (product && product.stock !== null && product.stock !== undefined) {
          await supabaseAdmin
            .from("products")
            .update({ stock: Math.max(0, Number(product.stock) - Number(it.quantity)) })
            .eq("id", it.product_id);
        }
      } catch (e) {
        console.error("Stock update failed for", it.product_id, e);
      }
    }

    // ২.৪ — কুপনের ব্যবহারসংখ্যা বাড়ানো
    if (matchedCoupon) {
      await supabaseAdmin
        .from("coupons")
        .update({ times_used: Number(matchedCoupon.times_used || 0) + 1 })
        .eq("id", matchedCoupon.id);
    }

    // ২.৫ — অটোমেটিক SMS (এখন সরাসরি ফাংশন কল — আগে ইন্টারনাল fetch admin-middleware-এ আটকে
    // সাইলেন্টলি ফেইল হতো, ফাংশন-কলে সেই সমস্যা নেই)
    if (newOrder && phone) {
      try {
        const orderIdShort = String(newOrder.id || "").slice(0, 6).toUpperCase();
        await sendSms(
          phone,
          `সম্মানিত ${customer_name || "গ্রাহক"},\nমায়াবী বুটিকস-এ আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে।\n\nঅর্ডার আইডি: #${orderIdShort}\nসর্বমোট: ৳${total_price}\n\nআমাদের সাথে থাকার জন্য ধন্যবাদ!`
        );
      } catch (smsErr) {
        console.error("SMS error:", smsErr);
      }
    }

    // ২.৬ — কাস্টমার ইমেইল দিয়ে থাকলে কনফার্মেশন ইমেইল (ঐচ্ছিক, best-effort)
    if (newOrder && email) {
      sendCustomerOrderConfirmation({
        toEmail: email,
        customerName: customer_name,
        orderId: String(newOrder.id),
        items: itemRows.map((it) => ({
          name: it.product_name,
          color: it.color || undefined,
          size: it.size || undefined,
          quantity: it.quantity,
          subtotal: it.subtotal,
        })),
        subtotal,
        discountAmount: discount_amount || undefined,
        couponCode: matchedCoupon?.code || null,
        totalPrice: total_price,
        address,
        city: body.city || "",
        region: body.region || "",
        paymentMethod: body.payment_method || "cod",
      }).catch((e) => console.error("Customer email error:", e));
    }

    // ২.৬ — এই ফোন নাম্বারে কোনো abandoned-cart ট্র্যাকিং রেকর্ড থাকলে "converted" করে দেওয়া,
    // যাতে অর্ডার সম্পন্ন করা কাস্টমারকে আর রিমাইন্ডার SMS না যায়
    if (phone) {
      supabaseAdmin
        .from("abandoned_carts")
        .update({ converted: true })
        .eq("phone", phone)
        .then(
          () => {},
          (e: any) => console.error("Abandoned-cart convert-flag error:", e)
        );
    }

    return NextResponse.json({ ok: true, order: { ...newOrder, items: itemRows } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "সার্ভার এরর" }, { status: 500 });
  }
}
