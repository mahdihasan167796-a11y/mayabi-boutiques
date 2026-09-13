import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase";
import { CategoryFilterGrid } from "@/components/category-filter-grid";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "সেল ও অফার | Mayabi Boutiques",
  description: "মায়াবী বুটিকস-এর চলমান ছাড়ের কালেকশন — সীমিত সময়ের জন্য বিশেষ মূল্যে।",
};

export default async function SalePage() {
  const { data } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });

  // যেসব প্রোডাক্টের old_price আসল price-এর চেয়ে বেশি (মানে সত্যিকারের ছাড় আছে)
  const discounted = (data ?? []).filter((p: any) => p.old_price && Number(p.old_price) > Number(p.price));

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      <div className="text-center mb-10">
        <span className="inline-block bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          🔥 Limited Time
        </span>
        <h1 className="font-serif text-2xl md:text-4xl font-bold text-white">সেল ও অফার সমূহ</h1>
        <p className="text-xs text-gray-500 mt-2">মায়াবী বুটিকস-এর সেরা ছাড়ের কালেকশন</p>
      </div>

      {discounted.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-24">এই মুহূর্তে কোনো সেল চলছে না — শীঘ্রই নতুন অফার আসছে!</p>
      ) : (
        <CategoryFilterGrid products={discounted} />
      )}
    </main>
  );
}
