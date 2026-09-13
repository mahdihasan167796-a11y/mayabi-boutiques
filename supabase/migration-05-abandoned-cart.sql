-- ============================================================
-- মাইগ্রেশন ০৫ — Abandoned Cart রিমাইন্ডার সিস্টেম
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- ============================================================

create table if not exists abandoned_carts (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  customer_name text,
  items jsonb not null,
  subtotal numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reminded_at timestamptz,
  converted boolean not null default false
);

alter table abandoned_carts enable row level security;
create unique index if not exists abandoned_carts_phone_idx on abandoned_carts(phone);
