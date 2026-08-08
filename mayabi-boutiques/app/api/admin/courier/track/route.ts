export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackingCode = searchParams.get("tracking_code");

  if (!trackingCode) {
    return NextResponse.json({ error: "Tracking code is required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.STEADFAST_API_KEY;
    const secretKey = process.env.STEADFAST_SECRET_KEY;

    // যদি কুরিয়ার API Key না থাকে, তবে ডেমো টেস্ট রেসপন্স পাঠাবে
    if (!apiKey || apiKey.includes("your_")) {
      return NextResponse.json({
        status: 200,
        delivery_status: "in_transit",
        msg: "Demo Tracking: পার্সেলটি এখন ডেলিভারি রাইডারের কাছে আছে (In-Transit)",
      });
    }

    // আসল Steadfast API Call
    const response = await fetch(`https://portal.steadfast.com.bd/api/v1/status_by_cid/${trackingCode}`, {
      method: "GET",
      headers: {
        "Api-Key": apiKey,
        "Secret-Key": secretKey || "",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courier status" }, { status: 500 });
  }
}