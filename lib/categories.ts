// ক্যাটাগরির তালিকা এখনো কোডেই রাখা হয়েছে (এগুলো প্রায় স্থায়ী — খুব ঘন ঘন বদলায় না)।
// প্রতিটি ক্যাটাগরির নিচে প্রোডাক্টগুলো এখন Supabase ডাটাবেজ থেকে ডায়নামিকভাবে আসে (lib/products.ts দেখুন)।

export interface Category {
  slug: string;
  name: string;
  tag: string;
  image: string;
}

export const categories: Category[] = [
  { slug: "one-piece", name: "ওয়ান-পিস", tag: "নতুন সংগ্রহ", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" },
  { slug: "two-piece", name: "টু-পিস", tag: "কমফোর্ট ফিট", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop" },
  { slug: "three-piece", name: "থ্রি-পিস", tag: "হিট কালেকশন", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop" },
  { slug: "couple-dress", name: "কাপল ড্রেস", tag: "ম্যাচিং কম্বো", image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=600&auto=format&fit=crop" },
  { slug: "boutique-print", name: "বুটিক্স প্রিন্ট", tag: "হ্যান্ডক্রাফটেড", image: "https://images.unsplash.com/photo-1610030470344-7893587f8f4a?q=80&w=600&auto=format&fit=crop" },
  { slug: "kurti-gown", name: "কুর্তি & গাউন", tag: "আধুনিক ট্রেন্ড", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop" },
  { slug: "saree", name: "শাড়ি", tag: "রাজকীয় ঐতিহ্য", image: "https://images.unsplash.com/photo-1610030470344-7893587f8f4a?q=80&w=600&auto=format&fit=crop" },
  { slug: "borka", name: "বোরকা", tag: "স্টাইলিশ আবায়া", image: "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=600&auto=format&fit=crop" },
  { slug: "panjabi", name: "Panjabi", tag: "উৎসবের সেরা ঐতিহ্য", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=600&auto=format&fit=crop" },
  { slug: "shirt", name: "Shirt", tag: "স্মার্ট ক্যাজুয়াল", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop" },
  { slug: "t-shirt", name: "T-Shirt", tag: "ডেইলি কমফোর্ট", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop" },
  { slug: "kids", name: "বাচ্চাদের জামা", tag: "কিউট কালেকশন", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?q=80&w=600&auto=format&fit=crop" },
];

export const featuredCategorySlugs = [
  "three-piece", "saree", "borka", "panjabi",
  "kurti-gown", "couple-dress", "shirt", "kids",
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
