-- ============================================================
-- মাইগ্রেশন ০২ — মাল্টি-আইটেম কার্ট + রিডিমেবল কুপন সিস্টেম
-- Supabase ড্যাশবোর্ডের SQL Editor-এ পুরোটা পেস্ট করে "Run" চাপুন।
-- এটা schema.sql-এর উপর বসবে, বিদ্যমান কোনো ডেটা মুছে ফেলবে না —
-- শুধু নতুন টেবিল/কলাম যোগ করবে (সব "if not exists" দিয়ে সুরক্ষিত)।
-- ============================================================

-- ================= ORDER ITEMS =================
-- একটা অর্ডারে এখন একাধিক প্রোডাক্ট থাকতে পারবে — প্রতিটা লাইন একটা প্রোডাক্ট/কালার/সাইজ কম্বিনেশন
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,

  product_id text not null,
  product_name text not null,
  category_slug text,
  image text,
  color text,
  size text,
  quantity int not null default 1,
  unit_price numeric not null,
  subtotal numeric not null
);
alter table order_items enable row level security;
create index if not exists order_items_order_id_idx on order_items(order_id);

-- ================= ORDERS টেবিল আপডেট =================
-- পুরনো সিঙ্গেল-প্রোডাক্ট কলামগুলো (product_id, product_name, unit_price) এখন থেকে
-- অপশনাল করা হলো — মাল্টি-আইটেম অর্ডারে আসল ডিটেইলস থাকবে order_items টেবিলে।
-- বিদ্যমান পুরনো অর্ডারগুলো অপরিবর্তিত থাকবে, ভাঙবে না।
alter table orders alter column product_id drop not null;
alter table orders alter column product_name drop not null;
alter table orders alter column unit_price drop not null;

-- ডিসকাউন্ট/কুপন হিসাবের জন্য নতুন কলাম
alter table orders add column if not exists subtotal numeric;
alter table orders add column if not exists discount_amount numeric not null default 0;
alter table orders add column if not exists coupon_code text;

-- কুরিয়ার বুকিং কোডের কলাম — আগেই কোডে ব্যবহার হচ্ছিল, schema.sql-এ ছিল না বলে এখানে নিশ্চিত করা হলো
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_code text;

-- ================= COUPONS =================
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  code text unique not null,                          -- যেমন: EID10  (সবসময় বড় হাতের অক্ষরে সেভ/চেক হবে)
  discount_type text not null default 'percentage',    -- 'percentage' অথবা 'fixed'
  discount_value numeric not null,                     -- percentage হলে ১–১০০, fixed হলে সরাসরি টাকার অংক

  min_order_amount numeric not null default 0,         -- এর নিচে অর্ডারে কুপন কাজ করবে না
  usage_limit int,                                      -- খালি (null) রাখলে আনলিমিটেড ব্যবহার
  times_used int not null default 0,
  expires_at timestamptz,                               -- খালি রাখলে কখনো এক্সপায়ার হবে না
  is_active boolean not null default true
);
alter table coupons enable row level security;
create index if not exists coupons_code_idx on coupons(code);
