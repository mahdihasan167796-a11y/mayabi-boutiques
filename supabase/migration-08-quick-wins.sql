-- ============================================================
-- মাইগ্রেশন ০৮ — নিউজলেটার, প্রোডাক্ট বিবরণ, WhatsApp ও ফ্রি-শিপিং সেটিংস
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- ============================================================

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
alter table newsletter_subscribers enable row level security;

alter table products add column if not exists description text;

alter table site_settings add column if not exists whatsapp_number text;
alter table site_settings add column if not exists free_shipping_threshold numeric default 0;
