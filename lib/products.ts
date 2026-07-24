// প্রোডাক্ট ডাটা এখন Supabase-এর `products` টেবিল থেকে আসে (আগে এখানে হার্ডকোডেড
// ডামি ডাটা ছিল)। এই ফাইলটি শুধুমাত্র সার্ভার কম্পোনেন্ট / API রুট থেকে ইমপোর্ট
// করা উচিত, যেহেতু এটি `supabaseAdmin` ব্যবহার করে।

import { supabaseAdmin } from "./supabase";

export interface ProductVariant {
  name?: string;
  image?: string;
  size?: string;    // 👈 সাইজ ট্র্যাকিং
  color?: string;   // 👈 কালার ট্র্যাকিং
  price?: number;
  oldPrice?: number;
  stock: number;    // 👈 প্রতিটি ভ্যারিয়েন্টের নির্দিষ্ট স্টক
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  oldPrice: number;
  stock?: number; // 👈 ওভারঅল স্টক (যদি প্রয়োজন হয়)
  minStockAlert?: number; // 👈 লো-স্টক নোটিফিকেশন থ্রেশহোল্ড
  images: string[];
  variants: ProductVariant[];
  sizes: string[];
  rating: string;
  questions: string;
}

// ডাটাবেজের snake_case রো-কে অ্যাপে ব্যবহৃত camelCase Product অবজেক্টে রূপান্তর করে
function mapRow(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    price: Number(row.price),
    oldPrice: Number(row.old_price ?? row.price),
    stock: row.stock != null ? Number(row.stock) : undefined, // 👈 ডাটাবেজ থেকে স্টক ম্যাপ করা হলো
    minStockAlert: row.min_stock_alert != null ? Number(row.min_stock_alert) : 3, // 👈 মিনিমাম স্টক অ্যালার্ট ম্যাপ করা হলো
    images: row.images ?? [],
    variants: row.variants ?? [],
    sizes: row.sizes ?? [],
    rating: row.rating ?? "221",
    questions: row.questions ?? "86",
  };
}

/** একটি নির্দিষ্ট ক্যাটাগরির সব প্রোডাক্ট আনে */
export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("category_slug", categorySlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getProductsByCategory error:", error.message);
    return [];
  }
  return (data ?? []).map(mapRow);
}

/** স্লাগ দিয়ে একটি নির্দিষ্ট প্রোডাক্ট খুঁজে বের করে */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

/** হোমপেজ ইত্যাদির জন্য সাম্প্রতিক কিছু প্রোডাক্ট আনে */
export async function getRecentProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentProducts error:", error.message);
    return [];
  }
  return (data ?? []).map(mapRow);
}