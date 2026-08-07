import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendOrderNotification } from "@/lib/email";

interface OrderPayload {
  productId: string;
  productName: string;
  categorySlug: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customerName: string;
  phone: string;
  region: string;
  city: string;
  area: string;
  address: string;
  addressLabel: string;
  paymentMethod: "cod" | "bkash" | "nagad";
  transactionId?: string;
}

export async function POST(request: Request) {
  let body: OrderPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "অবৈধ রিকোয়েস্ট বডি" }, { status: 400 });
  }

  if (!body.customerName || !body.phone || !body.address || !body.productId) {
    return NextResponse.json(
      { ok: false, error: "নাম, মোবাইল নাম্বার, ঠিকানা এবং প্রোডাক্ট আইডি আবশ্যক" },
      { status: 400 }
    );
  }

  if (!body.paymentMethod || !["cod", "bkash", "nagad"].includes(body.paymentMethod)) {
    return NextResponse.json({ ok: false, error: "পেমেন্ট পদ্ধতি নির্বাচন করুন" }, { status: 400 });
  }

  if (body.paymentMethod !== "cod" && !body.transactionId) {
    return NextResponse.json(
      { ok: false, error: "বিকাশ/নগদ পেমেন্টের জন্য ট্রানজেকশন আইডি আবশ্যক" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert([
      {
        product_id: body.productId,
        product_name: body.productName,
        category_slug: body.categorySlug,
        color: body.color,
        size: body.size,
        quantity: body.quantity,
        unit_price: body.unitPrice,
        total_price: body.totalPrice,
        customer_name: body.customerName,
        phone: body.phone,
        region: body.region,
        city: body.city,
        area: body.area,
        address: body.address,
        address_label: body.addressLabel,
        payment_method: body.paymentMethod,
        transaction_id: body.transactionId ?? null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error.message);
    return NextResponse.json(
      { ok: false, error: "অর্ডার সেভ করা যায়নি, একটু পরে আবার চেষ্টা করুন।" },
      { status: 500 }
    );
  }

  // অর্ডার নোটিফিকেশন ইমেইল — ব্যর্থ হলেও অর্ডার সফল থাকবে (best-effort)
  sendOrderNotification({
    productName: body.productName,
    color: body.color,
    size: body.size,
    quantity: body.quantity,
    totalPrice: body.totalPrice,
    customerName: body.customerName,
    phone: body.phone,
    address: body.address,
    region: body.region,
    city: body.city,
    paymentMethod: body.paymentMethod,
    transactionId: body.transactionId,
  }).catch(() => {});

  return NextResponse.json({ ok: true, order: data });
}
