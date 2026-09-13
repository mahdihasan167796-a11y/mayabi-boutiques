-- ============================================================
-- মাইগ্রেশন ০৭ — বাংলা + ইংরেজি বাইলিঙ্গুয়াল সাপোর্ট
-- Supabase SQL Editor-এ পেস্ট করে "Run" চাপুন।
-- ইংরেজি ফিল্ড খালি রাখলে সবসময় বাংলা ভার্সনটাই fallback হিসেবে দেখাবে,
-- তাই এখনই সব প্রোডাক্টে ইংরেজি নাম না দিলেও সাইট ভাঙবে না।
-- ============================================================

alter table products add column if not exists name_en text;
alter table categories add column if not exists name_en text;
alter table categories add column if not exists tag_en text;
