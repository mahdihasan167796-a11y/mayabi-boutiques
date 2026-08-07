export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ১. Pathao Access Token জেনারেট করার হেল্পার ফাংশন
async function getPathaoToken() {
  try {
    const res = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/issue-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.PATHAO_CLIENT_ID,
        client_secret: process.env.PATHAO_CLIENT_SECRET,
        username: process.env.PATHAO_USERNAME,
        password: process.env.PATHAO_PASSWORD,
        grant_type: "password",
      }),
    });
    const data = await res.json();
    return data.access_token || null;
  } catch (err) {
    console.error("Pathao Auth Error:", err);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, courierName, recipientName, recipientPhone, recipientAddress, amountToCollect } = body;

    if (!orderId || !courierName) {
      return NextResponse.json({ ok: false, error: "অর্ডার আইডি ও কুরিয়ারের নাম আবশ্যক" }, { status: 400 });
    }

    let trackingCode = "";
    let bookingResponse: any = null;

    // ----------- PATHAO INTEGRATION -----------
    if (courierName === "pathao") {
      const token = await getPathaoToken();
      if (!token) {
        return NextResponse.json({ ok: false, error: "Pathao API authentication failed" }, { status: 500 });
      }

      const pathaoRes = await fetch("https://api-hermes.pathao.com/aladdin/api/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store_id: Number(process.env.PATHAO_STORE_ID),
          merchant_order_id: orderId,
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          recipient_address: recipientAddress,
          amount_to_collect: amountToCollect || 0,
          item_type: 2, // Parcel
          delivery_type: 48, // Normal Delivery
          item_quantity: 1,
          item_weight: 0.5,
        }),
      });

      bookingResponse = await pathaoRes.json();
      trackingCode = bookingResponse?.data?.consignment_id || "";
    } 
    
    // ----------- REDX INTEGRATION -----------
    else if (courierName === "redx") {
      const redxRes = await fetch("https://openapi.redx.com.bd/v1.0.0/parcels", {
        method: "POST",
        headers: {
          API_ACCESS_TOKEN: `Bearer ${process.env.REDX_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: recipientName,
          customer_phone: recipientPhone,
          delivery_area: "Dhaka",
          customer_address: recipientAddress,
          cash_collection_amount: amountToCollect || 0,
          value: amountToCollect || 0,
          merchant_invoice_id: orderId,
        }),
      });

      bookingResponse = await redxRes.json();
      trackingCode = bookingResponse?.tracking_id || "";
    }

    // ----------- STEADFAST INTEGRATION -----------
    else if (courierName === "steadfast") {
      const sfRes = await fetch("https://portal.packzy.com/api/v1/create_order", {
        method: "POST",
        headers: {
          "Api-Key": process.env.STEADFAST_API_KEY || "",
          "Secret-Key": process.env.STEADFAST_SECRET_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoice: orderId,
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          recipient_address: recipientAddress,
          cod_amount: amountToCollect || 0,
        }),
      });

      bookingResponse = await sfRes.json();
      trackingCode = bookingResponse?.consignment?.tracking_code || "";
    }

    // ডাটাবেসে কুরিয়ারের নাম ও ট্র্যাকিং আইডি আপডেট করা
    await supabaseAdmin
      .from("orders")
      .update({
        courier_name: courierName,
        tracking_code: trackingCode,
        status: "shipped",
      })
      .eq("id", orderId);

    return NextResponse.json({
      ok: true,
      message: `${courierName.toUpperCase()} এ সফলভাবে অর্ডার বুকিং করা হয়েছে!`,
      trackingCode,
      details: bookingResponse,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "কুরিয়ার বুকিংয়ে এরর হয়েছে" }, { status: 500 });
  }
}