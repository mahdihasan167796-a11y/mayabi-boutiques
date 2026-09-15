import React from "react";
import Image from "next/image";
import Link from "next/link";
import HeroBanner from "@/components/hero-banner";
import { ProductCard } from "@/components/product-card";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// গোল ক্যাটাগরি ডাটা
const CIRCULAR_CATEGORIES = [
  { name: "SAVE 50%", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300", link: "/products?category=sale" },
  { name: "THOBE COLLECTION", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300", link: "/products?category=thobe" },
  { name: "WOMEN'S THREE PIECE", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300", link: "/products?category=three-piece" },
  { name: "ACTIVEWEAR", image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=300", link: "/products?category=activewear" },
  { name: "CUB KLUB KID'S", image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300", link: "/products?category=kids" },
  { name: "MEN'S POLO SHIRT", image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300", link: "/products?category=polo" },
  { name: "WOMEN'S ETHNIC TOP", image: "https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=300", link: "/products?category=ethnic" },
];

export default async function HomePage() {
  const { data: promoData } = await supabaseAdmin.from("promo_sections").select("*").order("sort_order", { ascending: true });
  const { data: siteSettings } = await supabaseAdmin.from("site_settings").select("*").single();
  const { data: allProducts } = await supabaseAdmin.from("products").select("*").order("created_at", { ascending: false }).limit(12);

  const heroBanners = promoData?.filter((i) => i.placement === "hero") || [];
  const midBanners = promoData?.filter((i) => i.placement === "mid") || [];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      
      {/* ১. হিরো ব্যানার/ভিডিও সেকশন (সরাসরি নেভবারের পর) */}
      <section className="w-full">
        {heroBanners.length > 0 ? (
          <HeroBanner banners={heroBanners} />
        ) : (
          <div className="relative w-full h-[60vh] bg-neutral-900 border-b border-neutral-800 flex items-center justify-center">
            <p className="text-amber-500 font-medium">অ্যাডমিন ড্যাশবোর্ড থেকে হিরো ব্যানার/ভিডিও যোগ করুন</p>
          </div>
        )}
      </section>

      {/* ২. ফিচারড কালেকশন */}
      <section className="py-12 max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "MEN'S FASHION", img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500" },
            { title: "WOMEN'S FASHION", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" },
            { title: "BOY'S FASHION", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500" },
            { title: "GIRL'S FASHION", img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500" },
          ].map((item, idx) => (
            <div key={idx} className="relative h-80 group overflow-hidden bg-neutral-900 rounded-lg border border-neutral-800">
              <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500 opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col items-center justify-end p-4">
                <span className="text-amber-400 font-bold text-sm tracking-wider mb-2">{item.title}</span>
                <button className="bg-amber-500 text-black px-4 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-amber-400 transition rounded-sm">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ৩. গোল ক্যাটাগরি */}
      <section className="py-8 border-y border-neutral-800 bg-neutral-950 max-w-7xl mx-auto px-4 w-full flex items-center gap-8">
        <div className="shrink-0">
          <h3 className="text-xl font-bold tracking-tight text-amber-500">WHAT'S<br />NEW</h3>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
          {CIRCULAR_CATEGORIES.map((cat, idx) => (
            <Link key={idx} href={cat.link} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-500/40 group-hover:border-amber-500 relative">
                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition duration-300" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-center text-gray-300 group-hover:text-amber-400 max-w-[90px]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ৪. মিড-পেজ ব্যানার/ভিডিও */}
      <section className="py-12 max-w-7xl mx-auto px-4 w-full">
        {midBanners.length > 0 ? (
          <div className="relative w-full h-[400px] overflow-hidden rounded-xl border border-neutral-800">
            {midBanners[0].media_type === "video" ? (
              <video src={midBanners[0].image} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <Image src={midBanners[0].image} alt="Mid Banner" fill className="object-cover" />
            )}
          </div>
        ) : (
          <div className="w-full h-80 bg-neutral-900 border border-neutral-800 flex items-center justify-center rounded-xl text-amber-500 font-medium">
            মিড-পেজ প্রমোশনাল ব্যানার/ভিডিও স্থান
          </div>
        )}
      </section>

      {/* ৫. সকল প্রোডাক্টস */}
      <section className="py-10 max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-xl font-bold mb-6 text-center tracking-widest uppercase text-amber-500">ALL PRODUCTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {allProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ৬. এক্সক্লুসিভ ব্র্যান্ড কালেকশন */}
      <section className="py-12 bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative h-64 col-span-1 row-span-2 rounded-lg overflow-hidden"><Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" fill alt="Saree" className="object-cover" /></div>
            <div className="relative h-32 rounded-lg overflow-hidden"><Image src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" fill alt="Saree" className="object-cover" /></div>
            <div className="relative h-32 rounded-lg overflow-hidden"><Image src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500" fill alt="Saree" className="object-cover" /></div>
          </div>
          <div className="text-center md:text-left space-y-4">
            <p className="text-xs uppercase tracking-widest text-amber-500">Introducing With</p>
            <h2 className="text-3xl font-bold tracking-tight text-white">MAYABI EXCLUSIVE SAREE</h2>
            <button className="bg-amber-500 text-black px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition rounded-sm">SHOP NOW</button>
          </div>
        </div>
      </section>

      {/* ৭. ডার্ক ফুটার */}
      <footer className="bg-black pt-12 pb-6 border-t border-neutral-800 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="text-center max-w-md mx-auto space-y-3">
            <h3 className="text-base font-bold text-white">Subscribe to Our Newsletter</h3>
            <div className="flex border border-neutral-700 rounded overflow-hidden">
              <input type="email" placeholder="Your email address" className="w-full px-3 py-2 outline-none bg-neutral-900 text-white" />
              <button className="bg-amber-500 text-black px-5 py-2 font-bold uppercase tracking-wider hover:bg-amber-400 transition">Subscribe</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-neutral-900 pt-8">
            <div className="space-y-2">
              <h4 className="font-bold text-amber-500 mb-3">Mayabi Outfitters</h4>
              <p>{siteSettings?.address || "ঢাকা, বাংলাদেশ"}</p>
              <p>{siteSettings?.email || "support@mayabiboutiques.com"}</p>
              <p>{siteSettings?.phone || "+8801700000000"}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white mb-3">Quick Links</h4>
              <p className="hover:text-amber-500 cursor-pointer">About Us</p>
              <p className="hover:text-amber-500 cursor-pointer">Blogs</p>
              <p className="hover:text-amber-500 cursor-pointer">Contact Us</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white mb-3">Policies</h4>
              <p className="hover:text-amber-500 cursor-pointer">Privacy Policy</p>
              <p className="hover:text-amber-500 cursor-pointer">Refund Policy</p>
              <p className="hover:text-amber-500 cursor-pointer">Terms & Conditions</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white mb-3">Account</h4>
              <p className="hover:text-amber-500 cursor-pointer">My Profile</p>
              <p className="hover:text-amber-500 cursor-pointer">My Cart</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-white mb-3">Download Our App</h4>
              <div className="space-y-2">
                <div className="bg-neutral-900 border border-neutral-800 text-white p-2 rounded text-center cursor-pointer hover:border-amber-500">Google Play</div>
                <div className="bg-neutral-900 border border-neutral-800 text-white p-2 rounded text-center cursor-pointer hover:border-amber-500">App Store</div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-600 border-t border-neutral-900 pt-4 text-[10px]">
            Copyright © 2026 Mayabi Boutiques. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
