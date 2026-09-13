-- ============================================================
-- মাইগ্রেশন ০৪ — স্টাফ লগইন সিস্টেম (profiles টেবিল)
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'order_handler',
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- প্রতিটা স্টাফ শুধু নিজের প্রোফাইল/রোল পড়তে পারবে (ড্যাশবোর্ডে "আমি কোন রোল" চেক করতে লাগে)।
-- অ্যাডমিন প্যানেলের "স্টাফ লিস্ট" সার্ভার-সাইড service-role দিয়ে সবাইকে দেখাবে, তাই এই পলিসিতে সমস্যা হবে না।
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);
