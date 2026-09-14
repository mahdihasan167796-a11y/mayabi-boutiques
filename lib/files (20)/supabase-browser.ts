import { createBrowserClient } from "@supabase/ssr";

// এই ক্লায়েন্টটা কুকিতে সেশন রাখে (localStorage না), যাতে middleware.ts সার্ভার-সাইডে
// লগইন করা স্টাফকে চিনতে পারে। শুধু auth-সংক্রান্ত ক্লায়েন্ট-সাইড কাজে (লগইন পেজ,
// অ্যাডমিন ড্যাশবোর্ডের রোল-চেক) ব্যবহার হবে — সাধারণ ডেটা fetch-এর জন্য lib/supabase.ts-এর
// ক্লায়েন্টই আগের মতো ব্যবহার হবে (সার্ভার কম্পোনেন্টেও ব্যবহৃত হয় বলে সেটা অপরিবর্তিত রাখা হয়েছে)।

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://xyzcompany.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy";

export const supabaseBrowser = createBrowserClient(supabaseUrl, supabaseAnonKey);
