-- ============================================================
-- মাইগ্রেশন ০৯ — প্রোমো সেকশন, লুকবুক, ইনস্টাগ্রাম-শোকেস, ডেলিভারি-চেকার,
-- স্টোর লোকেটর (খালি), রিভিউ ছবি, হিরো ভিডিও
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- ============================================================

-- সাব-ব্র্যান্ড/প্রোমো সেকশন (যেমন: "Festive Luxe", যেকোনো সিজনাল ক্যাম্পেইন)
create table if not exists promo_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image text,
  cta_label text default 'কালেকশন দেখুন',
  cta_link text default '/',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table promo_sections enable row level security;

-- লুকবুক গ্যালারি
create table if not exists lookbook_items (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  caption text,
  product_slug text, -- ঐচ্ছিক — কোনো প্রোডাক্টের সাথে লিংক করতে চাইলে
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table lookbook_items enable row level security;

-- ইনস্টাগ্রাম-স্টাইল শোকেস (ম্যানুয়ালি অ্যাডমিন থেকে যোগ করা, লাইভ API সিঙ্ক না)
create table if not exists instagram_showcase (
  id uuid primary key default gen_random_uuid(),
  image text not null,
  post_link text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table instagram_showcase enable row level security;

-- ডেলিভারি-চেকার — জেলাভিত্তিক আনুমানিক সময়
create table if not exists delivery_zones (
  id uuid primary key default gen_random_uuid(),
  district_name text not null,
  estimated_days text not null default '৩-৫ দিন',
  cod_available boolean not null default true,
  created_at timestamptz not null default now()
);
alter table delivery_zones enable row level security;

-- স্টোর লোকেটর — খালি টেবিল, বাস্তব আউটলেট থাকলে অ্যাডমিন থেকে যোগ হবে
create table if not exists store_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  phone text,
  map_link text,
  created_at timestamptz not null default now()
);
alter table store_locations enable row level security;

-- রিভিউতে ছবি আপলোডের সাপোর্ট
alter table reviews add column if not exists image_url text;

-- হিরো সেকশনে ভিডিও (সেট করা থাকলে ছবির বদলে ভিডিও দেখাবে)
alter table site_settings add column if not exists hero_video_url text;

-- SSLCommerz ইন্টিগ্রেশনের জন্য প্রস্তুতি (আসল ক্রেডেনশিয়াল ছাড়া নিষ্ক্রিয় থাকবে)
alter table site_settings add column if not exists sslcommerz_enabled boolean default false;
