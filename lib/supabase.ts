import { createClient } from "@supabase/supabase-js";

// ⚠️ এই ফাইলটি শুধুমাত্র সার্ভার-সাইডে (API route) ইমপোর্ট করবেন, কখনো ক্লায়েন্ট
// কম্পোনেন্টে নয় — কারণ SUPABASE_SERVICE_ROLE_KEY একটি গোপন/সিক্রেট কী, যেটা
// দিয়ে ডাটাবেজের সব ধরনের রিড/রাইট করা যায় (Row Level Security বাইপাস করে)।

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  // ডেভেলপমেন্টে .env.local ফাইল না থাকলে এখানেই স্পষ্ট এরর দেখাবে,
  // যাতে বোঝা যায় ঠিক কী মিসিং।
  console.warn(
    "⚠️ SUPABASE_URL অথবা SUPABASE_SERVICE_ROLE_KEY .env.local-এ পাওয়া যায়নি। " +
      "অর্ডার সেভ করা কাজ করবে না যতক্ষণ না এগুলো সেট করা হয়। README.md দেখুন।"
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl ?? "",
  supabaseServiceKey ?? "",
  { auth: { persistSession: false } }
);
