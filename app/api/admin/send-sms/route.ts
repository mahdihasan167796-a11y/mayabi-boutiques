import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone, message } = await req.json();

    if (!phone || !message) {
      return NextResponse.json({ error: "Phone and Message required" }, { status: 400 });
    }

    // ক্লায়েন্টের API Key এবং Sender ID এখানে পরিবেশ ফাইল (.env) থেকে লোড হবে
    const apiKey = process.env.SMS_API_KEY || "TEST_API_KEY";
    const senderId = process.env.SMS_SENDER_ID || "TEST_SENDER";

    // বাংলাদেশের জনপ্রিয় গেটওয়ে যেমন BulkSMSBD / Greenweb API রিকোয়েস্ট প্যাটার্ন:
    const smsUrl = `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${phone}&senderid=${senderId}&message=${encodeURIComponent(
      message
    )}`;

    // যদি আসল API Key বসানো থাকে তবে মেসেজ সেন্ট হবে, অন্যথায় কনসোলে টেস্ট লগ দেখাবে
    if (process.env.SMS_API_KEY) {
      await fetch(smsUrl);
    } else {
      console.log(`[SMS SIMULATION MODE] To: ${phone} | Msg: ${message}`);
    }

    return NextResponse.json({ success: true, message: "SMS triggered successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}