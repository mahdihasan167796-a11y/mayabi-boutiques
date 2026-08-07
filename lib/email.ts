import { Resend } from "resend";

interface OrderNotificationData {
  productName: string;
  color: string;
  size: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  phone: string;
  address: string;
  region: string;
  city: string;
  paymentMethod: string;
  transactionId?: string;
}

/**
 * নতুন অর্ডার এলে অ্যাডমিনের ইমেইলে নোটিফিকেশন পাঠায়।
 * এটি "best-effort" — ইমেইল পাঠাতে ব্যর্থ হলেও অর্ডার সেভ হওয়া আটকাবে না,
 * শুধু সার্ভার লগে এরর দেখাবে।
 */
export async function sendOrderNotification(order: OrderNotificationData) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.ADMIN_NOTIFY_EMAIL;
  const fromEmail = process.env.ORDER_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !toEmail) {
    console.warn(
      "⚠️ RESEND_API_KEY বা ADMIN_NOTIFY_EMAIL সেট নেই — অর্ডার নোটিফিকেশন ইমেইল পাঠানো হয়নি।"
    );
    return;
  }

  const paymentLabel =
    order.paymentMethod === "bkash" ? "বিকাশ" : order.paymentMethod === "nagad" ? "নগদ" : "ক্যাশ অন ডেলিভারি";

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Mayabi Boutiques <${fromEmail}>`,
      to: toEmail,
      subject: `🛍️ নতুন অর্ডার এসেছে — ${order.customerName}`,
      html: `
        <div style="font-family: sans-serif; font-size: 14px; line-height: 1.6;">
          <h2 style="color:#a37f3d;">নতুন অর্ডার পাওয়া গেছে!</h2>
          <p><strong>প্রোডাক্ট:</strong> ${order.productName}</p>
          <p><strong>কালার / সাইজ / পরিমাণ:</strong> ${order.color} / ${order.size} / ${order.quantity}টি</p>
          <p><strong>সর্বমোট মূল্য:</strong> ৳${order.totalPrice}</p>
          <p><strong>পেমেন্ট পদ্ধতি:</strong> ${paymentLabel}${
            order.transactionId ? ` (ট্রানজেকশন আইডি: ${order.transactionId})` : ""
          }</p>
          <hr />
          <p><strong>কাস্টমারের নাম:</strong> ${order.customerName}</p>
          <p><strong>মোবাইল:</strong> ${order.phone}</p>
          <p><strong>ঠিকানা:</strong> ${order.address}, ${order.city}, ${order.region}</p>
          <p style="margin-top:16px; color:#888;">অর্ডারের সম্পূর্ণ বিবরণ ও স্ট্যাটাস আপডেট করতে অ্যাডমিন প্যানেলে যান।</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Order notification email failed:", err);
  }
}
