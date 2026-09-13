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
export async function sendOrderNotification(order: OrderNotificationData) {  const apiKey = process.env.RESEND_API_KEY;
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
interface CustomerConfirmationData {
  toEmail: string;
  customerName: string;
  orderId: string;
  items: { name: string; color?: string; size?: string; quantity: number; subtotal: number }[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalPrice: number;
  address: string;
  city: string;
  region: string;
  paymentMethod: string;
}

/**
 * কাস্টমার ইমেইল দিয়ে থাকলে (ঐচ্ছিক ফিল্ড) তাকে একটা ব্র্যান্ডেড অর্ডার কনফার্মেশন ইমেইল পাঠায়।
 * এটাও "best-effort" — ব্যর্থ হলে অর্ডার প্রসেস আটকাবে না, শুধু সার্ভার লগে এরর দেখাবে।
 */
export async function sendCustomerOrderConfirmation(data: CustomerConfirmationData) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.ORDER_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !data.toEmail) return;

  const paymentLabel =
    data.paymentMethod === "bkash" ? "বিকাশ" : data.paymentMethod === "nagad" ? "নগদ" : "ক্যাশ অন ডেলিভারি";

  const itemRows = data.items
    .map(
      (it) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${it.name}${
          it.color || it.size ? ` (${[it.color, it.size].filter(Boolean).join(" / ")})` : ""
        }</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">৳${it.subtotal}</td>
      </tr>`
    )
    .join("");

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: `Mayabi Boutiques <${fromEmail}>`,
      to: data.toEmail,
      subject: `আপনার অর্ডারটি নিশ্চিত হয়েছে — #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; max-width:600px; margin:auto; color:#222;">
          <div style="text-align:center; padding:20px 0; border-bottom:2px solid #c9a054;">
            <h1 style="color:#c9a054; margin:0; font-size:22px;">⚜ MAYABI BOUTIQUES</h1>
          </div>
          <div style="padding:24px 8px;">
            <h2 style="font-size:18px; margin-top:0;">প্রিয় ${data.customerName || "গ্রাহক"}, আপনার অর্ডারের জন্য ধন্যবাদ! 💖</h2>
            <p style="font-size:14px; line-height:1.6;">
              আপনার অর্ডারটি সফলভাবে গৃহীত হয়েছে। অর্ডার আইডি: <strong>#${data.orderId.slice(0, 8).toUpperCase()}</strong>
            </p>
            <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:16px;">
              <thead>
                <tr style="background:#f5f5f5;">
                  <th style="padding:8px; text-align:left;">প্রোডাক্ট</th>
                  <th style="padding:8px; text-align:center;">পরিমাণ</th>
                  <th style="padding:8px; text-align:right;">মূল্য</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
            <div style="text-align:right; font-size:14px; margin-top:12px; line-height:1.8;">
              <p style="margin:0;">সাবটোটাল: ৳${data.subtotal}</p>
              ${
                data.discountAmount
                  ? `<p style="margin:0; color:#16a34a;">ছাড় ${data.couponCode ? `(${data.couponCode})` : ""}: -৳${data.discountAmount}</p>`
                  : ""
              }
              <p style="margin:0; font-weight:bold; font-size:16px; color:#c9a054;">সর্বমোট: ৳${data.totalPrice}</p>
            </div>
            <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />
            <p style="font-size:13px; color:#555;"><strong>পেমেন্ট:</strong> ${paymentLabel}</p>
            <p style="font-size:13px; color:#555;"><strong>ডেলিভারি ঠিকানা:</strong> ${data.address}, ${data.city}, ${data.region}</p>
            <p style="font-size:12px; color:#999; margin-top:24px;">
              কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন: support@mayabiboutiques.com
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Customer confirmation email failed:", err);
  }
}
