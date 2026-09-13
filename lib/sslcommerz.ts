// SSLCommerz পেমেন্ট গেটওয়ে ইন্টিগ্রেশন
// ==========================================
// এই ফাইলটা তখনই কাজ করবে যখন আপনি SSLCOMMERZ_STORE_ID ও SSLCOMMERZ_STORE_PASSWORD
// এনভায়রনমেন্ট ভ্যারিয়েবলে আসল মার্চেন্ট ক্রেডেনশিয়াল বসাবেন (sslcommerz.com-এ
// মার্চেন্ট অ্যাকাউন্ট খুলে পাবেন)। ক্রেডেনশিয়াল না থাকলে এই ফাংশনগুলো স্পষ্ট এরর
// দেবে — কোনো ভুয়া/সিমুলেটেড "সফল পেমেন্ট" দেখাবে না।

const isSandbox = process.env.SSLCOMMERZ_SANDBOX !== "false"; // ডিফল্ট sandbox, লাইভ করতে "false" সেট করুন
const BASE_URL = isSandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";

export function isSslcommerzConfigured(): boolean {
  return Boolean(process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD);
}

interface InitiatePaymentInput {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  siteUrl: string; // যেমন: https://mayabiboutiques.com (কলব্যাক URL বানাতে লাগে)
}

/** SSLCommerz-এ একটা পেমেন্ট সেশন শুরু করে, কাস্টমারকে যেখানে রিডাইরেক্ট করতে হবে সেই URL রিটার্ন করে */
export async function initiateSslcommerzPayment(input: InitiatePaymentInput) {
  if (!isSslcommerzConfigured()) {
    throw new Error(
      "SSLCommerz কনফিগার করা নেই — SSLCOMMERZ_STORE_ID ও SSLCOMMERZ_STORE_PASSWORD এনভায়রনমেন্ট ভ্যারিয়েবলে বসান।"
    );
  }

  const params = new URLSearchParams({
    store_id: process.env.SSLCOMMERZ_STORE_ID!,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
    total_amount: String(input.amount),
    currency: "BDT",
    tran_id: input.orderId,
    success_url: `${input.siteUrl}/api/payment/sslcommerz/success`,
    fail_url: `${input.siteUrl}/api/payment/sslcommerz/fail`,
    cancel_url: `${input.siteUrl}/api/payment/sslcommerz/cancel`,
    ipn_url: `${input.siteUrl}/api/payment/sslcommerz/ipn`,
    shipping_method: "NO",
    product_name: "Mayabi Boutiques Order",
    product_category: "Fashion",
    product_profile: "general",
    cus_name: input.customerName,
    cus_email: input.customerEmail || "customer@mayabiboutiques.com",
    cus_add1: input.customerAddress || "Bangladesh",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: input.customerPhone,
  });

  const res = await fetch(`${BASE_URL}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await res.json();

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new Error(data.failedreason || "SSLCommerz সেশন তৈরি করা যায়নি।");
  }

  return { gatewayUrl: data.GatewayPageURL as string, sessionKey: data.sessionkey as string };
}

/** পেমেন্ট সত্যিই বৈধ কিনা SSLCommerz-এর ভ্যালিডেশন API দিয়ে নিশ্চিত করে — success_url/IPN দুটো জায়গাতেই ব্যবহার করা উচিত */
export async function validateSslcommerzTransaction(valId: string) {
  if (!isSslcommerzConfigured()) {
    throw new Error("SSLCommerz কনফিগার করা নেই।");
  }

  const params = new URLSearchParams({
    val_id: valId,
    store_id: process.env.SSLCOMMERZ_STORE_ID!,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD!,
    format: "json",
  });

  const res = await fetch(`${BASE_URL}/validator/api/validationserverAPI.php?${params.toString()}`);
  const data = await res.json();

  const isValid = data.status === "VALID" || data.status === "VALIDATED";
  return { isValid, data };
}
