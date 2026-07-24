// প্রোডাক্ট ডাটা এখন Supabase-এর `products` টেবিল থেকে আসে।
// এই ফাইলটি শুধুমাত্র সার্ভার কম্পোনেন্ট / API রুট থেকে ইমপোর্ট করা উচিত।

import { supabaseAdmin } from "./supabase";

export interface ProductVariant {
  name?: string;
  image?: string;
  size?: string;    // 👈 সাইজ ট্র্যাকিং
  color?: string;   // 👈 কালার ট্র্যাকিং
  price?: number;
  oldPrice?: number;
  stock: number;    // 👈 প্রতিটি ভ্যারিয়েন্টের নির্দিষ্ট স্টক
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  price: number;
  oldPrice: number;
  stock: number; // 👈 বাধ্যতামূলক সংখ্যা (০ বা তার বেশি)
  minStockAlert: number;
  images: string[];
  variants: ProductVariant[];
  sizes: string[];
  rating: string;
  questions: string;
}

// ডাটাবেজের snake_case রো-কে অ্যাপে ব্যবহৃত camelCase Product অবজেক্টে রূপান্তর করে
function mapRow(row: any): Product {
  // ১. ওভারঅল স্টক বের করা (যদি ডেটাবেজে null/undefined থাকে তবে default 0)
  const parsedStock = row.stock !== null && row.stock !== undefined ? Number(row.stock) : 0;

  // ২. ভ্যারিয়েন্ট সমূহের স্টক ঠিক করা
  const rawVariants = Array.isArray(row.variants) ? row.variants : [];
  const formattedVariants: ProductVariant[] = rawVariants.map((v: any) => {
    // যদি ভ্যারিয়েন্টে নির্দিষ্ট স্টক ডিফাইন করা থাকে (এমনকি 0 হলেও), তবে সেটাই নেবে
    const hasVariantStock = v?.stock !== null && v?.stock !== undefined;
    const variantStock = hasVariantStock ? Number(v.stock) : parsedStock;

    return {
      ...v,
      stock: isNaN(variantStock) ? 0 : variantStock,
    };
  });

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    price: Number(row.price ?? 0),
    oldPrice: Number(row.old_price ?? row.price ?? 0),
    stock: isNaN(parsedStock) ? 0 : parsedStock, // ✅ নিখুঁত সংখ্যা নিশ্চিত
    minStockAlert: row.min_stock_alert != null ? Number(row.min_stock_alert) : 3,
    images: row.images ?? [],
    variants: formattedVariants,
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