import React from "react";
import Image from "next/image";
import Link from "next/link";
import HeroBanner from "@/components/hero-banner";
import SiteFooter from "@/components/site-footer";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ১২টি গোলাকার ক্যাটাগরির লিস্ট
const CIRCULAR_CATEGORIES = [
  { name: "শাড়ি", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300", link: "/products?category=saree" },
  { name: "থ্রি-পিস", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300", link: "/products?category=three-piece" },
  { name: "পাঞ্জাবি", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300", link: "/products?category=panjabi" },
  { name: "লেহেঙ্গা", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300", link: "/products?category=lehenga" },
  { name: "কুুর্তি", image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=300", link: "/products?category=kurti" },
  { name: "কিডস গালস", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300", link: "/products?category=kids-girls" },
  { name: "কিডস বয়স", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=300", link: "/products?category=kids-boys" },
  { name: "ওয়েস্টার্ন", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300", link: "/products?category=western" },
  { name: "জুয়েলারি", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300", link: "/products?category=jewellery" },
  { name: "ব্যাগস", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300", link: "/products?category=bags" },
  { name: "জুতা", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300", link: "/products?category=shoes" },
  { name: "অফার কালেকশন", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300", link: "/products?category=offers" },
];

export default async function HomePage() {
  // প্রমো ডাটা ফেচ
  const { data: promoData } = await supabaseAdmin
    .from("promo_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  const heroBanners = promoData?.filter((item) => item.placement === "hero") || [];
  const midBanners = promoData?.filter((item) => item.placement === "mid") || [];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ১. টপ ক্যাটাগরি মেনু বার (Men / Women / Kids) */}
      <nav className="bg-neutral-900 border-b border-neutral-800 py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-center items-center gap-8 text-sm md:text-base font-semibold tracking-wider">
          <Link href="/products?gender=men" className="hover:text-amber-500 transition py-1 border-b-2 border-transparent hover:border-amber-500">
            MEN
          </Link>
          <Link href="/products?gender=women" className="hover:text-amber-500 transition py-1 border-b-2 border-transparent hover:border-amber-500">
            WOMEN
          </Link>
          <Link href="/products?gender=kids" className="hover:text-amber-500 transition py-1 border-b-2 border-transparent hover:border-amber-500">
            KIDS
          </Link>
          <Link href="/products?offer=true" className="text-amber-500 hover:text-amber-400 transition py-1 font-bold">
            SPECIAL OFFERS
          </Link>
        </div>
      </nav>

      {/* ২. হিরো স্লাইডার ও ভিডিও সেকশন */}
      {heroBanners.length > 0 ? (
        <HeroBanner banners={heroBanners} />
      ) : (
        <div className="relative w-full h-[50vh] bg-neutral-900 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-gray-500">নতুন ব্যানার যোগ করুন</h2>
        </div>
      )}

      {/* ৩. ১২টি গোল সার্কুলার ক্যাটাগরি বার */}
      <section className="py-10 max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-xl md:text-2xl font-bold text-center mb-8 tracking-wide uppercase">
          শপিং করুন ক্যাটাগরি অনুযায়ী
        </h2>
        <div className="flex items-center gap-6 overflow-x-auto pb-4 scrollbar-none justify-start md:justify-center">
          {CIRCULAR_CATEGORIES.map((cat, idx) => (
            <Link key={idx} href={cat.link} className="flex flex-col items-center gap-3 shrink-0 group">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-amber-500/40 group-hover:border-amber-500 group-hover:scale-105 transition-all relative">
                <Image src={cat.image} alt={cat.name} fill className="object-cover" />
              </div>
              <span className="text-xs md:text-sm font-medium group-hover:text-amber-500 transition text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ৪. মিড-পেজ প্রমোশনাল ব্যানার/ভিডিও সেকশন */}
      {midBanners.length > 0 && (
        <section className="py-8 max-w-7xl mx-auto px-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {midBanners.map((banner) => (
              <div key={banner.id} className="relative h-64 md:h-80 rounded-2xl overflow-hidden group border border-neutral-800">
                {banner.media_type === "video" ? (
                  <video src={banner.image} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                ) : (
                  <Image src={banner.image} alt={banner.title || "Mid Banner"} fill className="object-cover group-hover:scale-105 transition duration-500" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6">
                  {banner.title && <h3 className="text-xl font-bold text-white mb-1">{banner.title}</h3>}
                  {banner.cta_label && banner.cta_link && (
                    <Link href={banner.cta_link} className="inline-block mt-2 text-sm font-semibold text-amber-400 hover:underline">
                      {banner.cta_label} →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ৫. ফুটোভাট/ফুটার সেকশন */}
      <SiteFooter />
    </div>
  );
}
