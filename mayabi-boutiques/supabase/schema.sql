-- এই স্ক্রিপ্টটি Supabase ড্যাশবোর্ডের "SQL Editor"-এ পেস্ট করে "Run" চাপুন।
-- এটি একবারই রান করলেই হবে (নতুন প্রজেক্টে)। আগে থেকে orders টেবিল থাকলে
-- নিচের ALTER TABLE অংশটুকু আলাদাভাবে রান করুন পেমেন্ট কলাম যোগ করতে।

-- ================= PRODUCTS =================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  slug text unique not null,
  name text not null,
  category_slug text not null,
  price numeric not null,
  old_price numeric,
  images text[] not null default '{}',
  variants jsonb not null default '[]',   -- [{ "name": "...", "image": "..." }]
  sizes text[] not null default '{}',
  rating text default '221',
  questions text default '86'
);
alter table products enable row level security;

-- ================= ORDERS =================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  product_id text not null,
  product_name text not null,
  category_slug text,
  color text,
  size text,
  quantity int not null default 1,
  unit_price numeric not null,
  total_price numeric not null,

  customer_name text not null,
  phone text not null,
  region text,
  city text,
  area text,
  address text not null,
  address_label text,

  payment_method text not null default 'cod',  -- cod | bkash | nagad
  transaction_id text,

  status text not null default 'pending'  -- pending | confirmed | shipped | delivered | cancelled
);
alter table orders enable row level security;

-- আগে থেকে orders টেবিল থাকলে (আগের ভার্সন থেকে আপগ্রেড করছেন) শুধু এই দুই লাইন রান করুন:
-- alter table orders add column if not exists payment_method text not null default 'cod';
-- alter table orders add column if not exists transaction_id text;

-- ================= SITE SETTINGS =================
-- ফুটারের সোশ্যাল লিংক ও যোগাযোগ নাম্বার — অ্যাডমিন প্যানেলের Settings ট্যাব থেকে এডিট হয়।
-- সবসময় একটি মাত্র রো থাকবে (id = 1)।
create table if not exists site_settings (
  id int primary key default 1,
  facebook_url text default '',
  instagram_url text default '',
  tiktok_url text default '',
  messenger_url text default '',
  phone_number text default '',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
alter table site_settings enable row level security;

insert into site_settings (id) values (1)
on conflict (id) do nothing;
