import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export default async function LookbookPage() {
  const { data } = await supabaseAdmin.from("lookbook_items").select("*").order("sort_order", { ascending: true });
  const items = data ?? [];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Gallery</span>
        <h1 className="font-serif text-2xl md:text-4xl font-bold text-white mt-1">লুকবুক</h1>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-24">শীঘ্রই নতুন ফটোশুট গ্যালারি আসছে!</p>
      ) : (
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {items.map((item: any) => {
            const Wrapper = item.product_slug ? Link : "div";
            const wrapperProps = item.product_slug ? { href: `/product/${item.product_slug}` } : {};
            return (
              <Wrapper
                key={item.id}
                {...(wrapperProps as any)}
                className="block break-inside-avoid rounded-2xl overflow-hidden border border-white/10 group relative"
              >
                <img src={item.image} alt={item.caption || ""} className="w-full h-auto group-hover:scale-105 transition-transform duration-500 ease-out" />
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-xs text-white font-medium">{item.caption}</p>
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>
      )}
    </main>
  );
}
