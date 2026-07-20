import { createClient } from "@supabase/supabase-js";

// ⚠️ এই ফাইলটি সার্ভার-সাইডে (API route) ইমপোর্ট করবেন।
// বিল্ড টাইমে URL মিসিং থাকলে যেন Invalid URL এরর না দেয়, সেজন্য fallback URL যুক্ত করা হয়েছে।

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});