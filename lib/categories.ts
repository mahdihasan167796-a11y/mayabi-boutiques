// ক্যাটাগরি এখন Supabase-এর `categories` টেবিল থেকে আসে — অ্যাডমিন প্যানেল থেকে
// নতুন ক্যাটাগরি যোগ/এডিট/মুছা যাবে, কোনো কোড ডিপ্লয়ের দরকার হবে না।

import { supabaseAdmin } from "./supabase";

export interface Category {
  id?: string;
  slug: string;
  name: string;
  name_en?: string;
  tag: string;
  tag_en?: string;
  image: string;
  isFeatured?: boolean;
  sortOrder?: number;
}

// অ্যাডমিন ড্যাশবোর্ড ও বিভিন্ন পেজের ক্যাশ/ব্যাকআপ ক্যাটাগরি লিস্ট
export const categories: Category[] = [
  { slug: "three-piece", name: "থ্রি-পিস", tag: "Three Piece", image: "" },
  { slug: "saree", name: "শাড়ি", tag: "Saree", image: "" },
  { slug: "kurti", name: "কুর্তি", tag: "Kurti", image: "" },
  { slug: "lehenga", name: "লেহেঙ্গা", tag: "Lehenga", image: "" },
];

function mapRow(row: any): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    name_en: row.name_en || undefined,
    tag: row.tag || "",
    tag_en: row.tag_en || undefined,
    image: row.image || "",
    isFeatured: row.is_featured ?? true,
    sortOrder: row.sort_order ?? 0,
  };
}

/** সবগুলো ক্যাটাগরি sort_order অনুযায়ী সাজিয়ে আনে */
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategories error:", error.message);
    return categories; // ডাটাবেজ রেসপন্স না করলে ব্যাকআপ ক্যাটাগরি রিটার্ন করবে
  }
  return (data ?? []).map(mapRow);
}

/** শুধু হোমপেজে "ফিচারড" হিসেবে দেখানো ক্যাটাগরিগুলো আনে */
export async function getFeaturedCategories(): Promise<Category[]> {
  const all = await getCategories();
  return all.filter((c) => c.isFeatured !== false);
}

/** স্লাগ দিয়ে একটা নির্দিষ্ট ক্যাটাগরি খুঁজে বের করে */
export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return undefined;
  return mapRow(data);
}
