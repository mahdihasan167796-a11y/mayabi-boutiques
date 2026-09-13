import { NextResponse } from "next/server";
import { sendSms } from "@/lib/sms";

export async function POST(req: Request) {
  try {
    const { phone, message } = await req.json();

    const result = await sendSms(phone, message);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "Failed to send SMS" }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "SMS triggered successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
