-- ============================================================
-- মাইগ্রেশন ১০ — কাস্টমার লগইন/অ্যাকাউন্ট সিস্টেম
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- ============================================================

alter table orders add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists orders_user_id_idx on orders(user_id);
