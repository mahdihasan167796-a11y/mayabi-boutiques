// একটাই জায়গায় SMS পাঠানোর লজিক রাখা হলো, যাতে অ্যাডমিন রুট (ম্যানুয়াল SMS বাটন) এবং
// সার্ভার-সাইড কোড (নতুন অর্ডার/abandoned-cart cron) — দুটোই একই ফাংশন সরাসরি কল করতে পারে।
// আগে অর্ডার-ক্রিয়েশন কোড থেকে "/api/admin/send-sms"-কে ইন্টারনাল fetch দিয়ে কল করা হতো,
// কিন্তু ওই রুটটা middleware-এ admin-অথ-প্রোটেক্টেড — সার্ভার-টু-সার্ভার fetch-এ কুকি/সেশন
// থাকে না, তাই ওই কলটা 401 দিয়ে সাইলেন্টলি ফেইল হয়ে যাওয়ার কথা। ফাংশন-কল হলে এই সমস্যা থাকে না।
export async function sendSms(phone: string, message: string): Promise<{ ok: boolean; error?: string }> {
  if (!phone || !message) {
    return { ok: false, error: "Phone and Message required" };
  }

  try {
    const apiKey = process.env.SMS_API_KEY || "TEST_API_KEY";
    const senderId = process.env.SMS_SENDER_ID || "TEST_SENDER";

    const smsUrl = `https://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${phone}&senderid=${senderId}&message=${encodeURIComponent(
      message
    )}`;

    if (process.env.SMS_API_KEY) {
      await fetch(smsUrl);
    } else {
      console.log(`[SMS SIMULATION MODE] To: ${phone} | Msg: ${message}`);
    }

    return { ok: true };
  } catch (error) {
    console.error("SMS send failed:", error);
    return { ok: false, error: "Failed to send SMS" };
  }
}
