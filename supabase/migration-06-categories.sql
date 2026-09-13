-- ============================================================
-- মাইগ্রেশন ০৬ — অ্যাডমিন থেকে ক্যাটাগরি বাড়ানো/কমানোর সিস্টেম
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- এতদিন ক্যাটাগরি lib/categories.ts ফাইলে হার্ডকোড করা ছিল — এখন থেকে ডাটাবেজ থেকে আসবে,
-- অ্যাডমিন প্যানেল থেকেই নতুন ক্যাটাগরি যোগ/এডিট/মুছা যাবে, কোনো কোড পরিবর্তনের দরকার হবে না।
-- ============================================================

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tag text,
  image text,
  is_featured boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table categories enable row level security;

-- বিদ্যমান ১২টা ক্যাটাগরি ডাটাবেজে সিড করা হলো, যাতে কিছু হারিয়ে না যায় (আগে থেকে থাকলে স্কিপ হবে)
insert into categories (slug, name, tag, image, sort_order) values
  ('one-piece', 'ওয়ান-পিস', 'নতুন সংগ্রহ', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop', 1),
  ('two-piece', 'টু-পিস', 'কমফোর্ট ফিট', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop', 2),
  ('three-piece', 'থ্রি-পিস', 'হিট কালেকশন', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop', 3),
  ('couple-dress', 'কাপল ড্রেস', 'ম্যাচিং কম্বো', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop', 4),
  ('boutique-print', 'বুটিক্স প্রিন্ট', 'হ্যান্ডক্রাফটেড', 'https://images.unsplash.com/photo-1610030470344-7893587f8f4a?q=80&w=600&auto=format&fit=crop', 5),
  ('kurti-gown', 'কুর্তি & গাউন', 'আধুনিক ট্রেন্ড', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop', 6),
  ('saree', 'শাড়ি', 'রাজকীয় ঐতিহ্য', 'https://images.unsplash.com/photo-1610030470344-7893587f8f4a?q=80&w=600&auto=format&fit=crop', 7),
  ('borka', 'বোরকা', 'স্টাইলিশ আবায়া', 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600&auto=format&fit=crop', 8),
  ('panjabi', 'Panjabi', 'উৎসবের সেরা ঐতিহ্য', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop', 9),
  ('shirt', 'Shirt', 'স্মার্ট ক্যাজুয়াল', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop', 10),
  ('t-shirt', 'T-Shirt', 'ডেইলি কমফোর্ট', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop', 11),
  ('kids', 'বাচ্চাদের জামা', 'কিউট কালেকশন', 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop', 12)
on conflict (slug) do nothing;
