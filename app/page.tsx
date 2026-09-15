import React from "react";
import Image from "next/image";
import Link from "next/link";
import HeroBanner from "@/components/hero-banner";
import { ProductCard } from "@/components/product-card";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ছবি ৪ অনুযায়ী গোল ক্যাটাগরি ডাটা
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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      
      {/* ১. মেনুবার ও নাম */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-wider text-black">
            MAYABI BOUTIQUES
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-widest text-gray-800">
            <Link href="/" className="hover:text-amber-600 transition">HOME</Link>
            <Link href="/products?category=new" className="hover:text-amber-600 transition">NEW IN</Link>
            <Link href="/products?category=summer" className="hover:text-amber-600 transition">SUMMER</Link>
            <Link href="/products?category=black" className="hover:text-amber-600 transition">BLACK</Link>
            <Link href="/products?category=men" className="hover:text-amber-600 transition">MEN</Link>
            <Link href="/products?category=women" className="hover:text-amber-600 transition">WOMEN</Link>
            <Link href="/products?category=accessories" className="hover:text-amber-600 transition">ACCESSORIES</Link>
          </nav>
          <div className="flex items-center gap-4 text-gray-700">
            <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <svg className="w-5 h-5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          </div>
        </div>
      </header>

      {/* ২. ব্যানার এবং ভিডিও বসানোর জায়গা (Hero Section) */}
      <section className="w-full">
        {heroBanners.length > 0 ? (
          <HeroBanner banners={heroBanners} />
        ) : (
          <div className="relative w-full h-[60vh] bg-gray-100 flex items-center justify-center">
            <p className="text-gray-400">অ্যাডমিন ড্যাশবোর্ড থেকে হিরো ব্যানার/ভিডিও যোগ করুন</p>
          </div>
        )}
      </section>

      {/* ৩. ফিচারড কালেকশন */}
      <section className="py-12 max-w-7xl mx-auto px-4 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "MEN'S FASHION", img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500" },
            { title: "WOMEN'S FASHION", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" },
            { title: "BOY'S FASHION", img: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500" },
            { title: "GIRL'S FASHION", img: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500" },
          ].map((item, idx) => (
            <div key={idx} className="relative h-80 group overflow-hidden bg-gray-100">
              <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-end p-4">
                <span className="text-white font-bold text-sm tracking-wider mb-2">{item.title}</span>
                <button className="bg-white text-black px-4 py-1 text-xs font-semibold uppercase tracking-wider hover:bg-black hover:text-white transition">
                  Shop Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ৪. গোল ক্যাটাগরি */}
      <section className="py-8 border-y border-gray-100 max-w-7xl mx-auto px-4 w-full flex items-center gap-8">
        <div className="shrink-0">
          <h3 className="text-xl font-bold tracking-tight">WHAT'S<br />NEW</h3>
        </div>
        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
          {CIRCULAR_CATEGORIES.map((cat, idx) => (
            <Link key={idx} href={cat.link} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 relative">
                <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition duration-300" />
              </div>
              <span className="text-[10px] font-bold tracking-wider text-center text-gray-700 max-w-[90px]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ৫. মিড-পেজ ব্যানার/ভিডিও */}
      <section className="py-12 max-w-7xl mx-auto px-4 w-full">
        {midBanners.length > 0 ? (
          <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            {midBanners[0].media_type === "video" ? (
              <video src={midBanners[0].image} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            ) : (
              <Image src={midBanners[0].image} alt="Mid Banner" fill className="object-cover" />
            )}
          </div>
        ) : (
          <div className="w-full h-80 bg-gray-100 flex items-center justify-center rounded-lg text-gray-400">
            মিড-পেজ প্রমোশনাল ব্যানার/ভিডিও স্থান
          </div>
        )}
      </section>

      {/* ৬. সকল প্রোডাক্টস */}
      <section className="py-10 max-w-7xl mx-auto px-4 w-full">
        <h2 className="text-xl font-bold mb-6 text-center tracking-widest uppercase">ALL PRODUCTS</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {allProducts?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ৭. এক্সক্লুসিভ ব্র্যান্ড কালেকশন */}
      <section className="py-12 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative h-64 col-span-1 row-span-2"><Image src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" fill alt="Saree" className="object-cover" /></div>
            <div className="relative h-32"><Image src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500" fill alt="Saree" className="object-cover" /></div>
            <div className="relative h-32"><Image src="https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=500" fill alt="Saree" className="object-cover" /></div>
          </div>
          <div className="text-center md:text-left space-y-4">
            <p className="text-xs uppercase tracking-widest text-gray-500">Introducing With</p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">MAYABI EXCLUSIVE SAREE</h2>
            <button className="bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-wider">SHOP NOW</button>
          </div>
        </div>
      </section>

      {/* ৮. ফুটার সেকশন */}
      <footer className="bg-stone-100 pt-12 pb-6 border-t border-gray-200 text-xs text-gray-600">
        <div className="max-w-7xl mx-auto px-4 space-y-10">
          <div className="text-center max-w-md mx-auto space-y-3">
            <h3 className="text-base font-bold text-gray-900">Subscribe to Our Newsletter</h3>
            <div className="flex border border-gray-400">
              <input type="email" placeholder="Your email address" className="w-full px-3 py-2 outline-none bg-white text-gray-800" />
              <button className="bg-black text-white px-5 py-2 font-bold uppercase tracking-wider">Subscribe</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-t border-gray-200 pt-8">
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 mb-3">Mayabi Outfitters</h4>
              <p>{siteSettings?.address || "ঢাকা, বাংলাদেশ"}</p>
              <p>{siteSettings?.email || "support@mayabiboutiques.com"}</p>
              <p>{siteSettings?.phone || "+8801700000000"}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 mb-3">Quick Links</h4>
              <p>About Us</p>
              <p>Blogs</p>
              <p>Contact Us</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 mb-3">Policies</h4>
              <p>Privacy Policy</p>
              <p>Refund Policy</p>
              <p>Terms & Conditions</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 mb-3">Account</h4>
              <p>My Profile</p>
              <p>My Cart</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-gray-900 mb-3">Download Our App</h4>
              <div className="space-y-2">
                <div className="bg-black text-white p-2 rounded text-center cursor-pointer">Google Play</div>
                <div className="bg-black text-white p-2 rounded text-center cursor-pointer">App Store</div>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 border-t border-gray-200 pt-4 text-[10px]">
            Copyright © 2026 Mayabi Boutiques. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}
