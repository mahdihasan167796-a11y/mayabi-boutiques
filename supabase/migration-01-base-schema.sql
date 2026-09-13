-- ============================================================
-- মাইগ্রেশন ০১ — বেস স্কিমা (নতুন Supabase প্রজেক্টের জন্য)
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন — এটাই সবার আগে রান করতে হবে,
-- migration-02 থেকে migration-11 পর্যন্ত সবগুলো এই ৪টা বেস টেবিলের উপর ভিত্তি করে তৈরি।
-- বিদ্যমান কোনো প্রজেক্টে (যেখানে এই টেবিলগুলো আগে থেকেই আছে) এটা রান করার দরকার নেই।
-- ============================================================

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

  product_id text,
  product_name text,
  category_slug text,
  color text,
  size text,
  quantity int not null default 1,
  unit_price numeric,
  total_price numeric not null,

  customer_name text not null,
  phone text not null,
  region text,
  city text,
  area text,
  address text not null,
  address_label text,

  payment_method text not null default 'cod',  -- cod | bkash | nagad | rocket | sslcommerz
  transaction_id text,

  status text not null default 'pending'  -- pending | confirmed | shipped | delivered | cancelled
);
alter table orders enable row level security;

-- ================= SITE SETTINGS =================
-- সবসময় একটি মাত্র রো থাকবে (id = 1) — অ্যাডমিন প্যানেলের Settings ট্যাব থেকে এডিট হয়
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

-- ================= REVIEWS =================
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  product_id text not null,
  customer_name text not null,
  location text,
  rating int not null default 5,
  comment text not null,

  show_on_home boolean not null default false,
  show_on_product boolean not null default true
);
alter table reviews enable row level security;
create index if not exists reviews_product_id_idx on reviews(product_id);
