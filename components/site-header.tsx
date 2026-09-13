"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/mobile-nav";
import { formatBDT } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useI18n, localizedName } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CategoryMegaMenu } from "@/components/category-mega-menu";

interface Product {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  price: number;
  images: string[];
}

function AccountButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/account"
      aria-label="আমার অ্যাকাউন্ট"
      className={`w-9 h-9 flex items-center justify-center rounded-full border border-white/10 text-gray-300 hover:border-amber-500/40 hover:text-amber-400 transition-all duration-500 ease-out shrink-0 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      </svg>
    </Link>
  );
}

function WishlistButton({ className = "" }: { className?: string }) {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      aria-label="উইশলিস্ট দেখুন"
      className={`relative w-9 h-9 flex items-center justify-center rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition-all duration-500 ease-out shrink-0 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path d="M12 21s-7.5-4.6-10-9.3C.5 8.1 2.3 4.5 6 4c2-.3 3.7.7 6 3 2.3-2.3 4-3.3 6-3 3.7.5 5.5 4.1 4 7.7C19.5 16.4 12 21 12 21z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold border border-[#0a0a0a]">
          {count}
        </span>
      )}
    </Link>
  );
}

function CartButton({ className = "" }: { className?: string }) {
  const { itemCount, openCart } = useCart();
  return (
    <button
      onClick={openCart}
      aria-label="কার্ট খুলুন"
      className={`relative w-9 h-9 flex items-center justify-center rounded-full border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black transition-all shrink-0 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[#7a121d] text-white text-[9px] font-bold border border-[#0b0b0a]">
          {itemCount}
        </span>
      )}
    </button>
  );
}

interface CategoryItem {
  slug: string;
  name: string;
  name_en?: string;
}

export function SiteHeader({ products = [], categories = [] }: { products?: Product[]; categories?: CategoryItem[] }) {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const searchRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // 🚫 এডমিন প্যানেল হলে হেডার পুরোপুরি হাইড হয়ে যাবে
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // যদি সরাসরি প্রোপসে প্রোডাক্ট না আসে তবে এপিআই থেকে লোড করে নেওয়া
  useEffect(() => {
    if (products.length > 0) {
      setAllProducts(products);
    } else {
      fetch("/api/products")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAllProducts(data);
          else if (data.products) setAllProducts(data.products);
        })
        .catch(() => {});
    }
  }, [products]);

  // কাস্টমার যা টাইপ করবে তা দিয়ে নাম ও ক্যাটাগরি ফিল্টার করা
  const filteredProducts = searchQuery.trim() === ""
    ? []
    : allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category_slug.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // সার্চ বার ও More ড্রপডাউনের বাইরে ক্লিক করলে পপআপ বন্ধ করা
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // প্রোডাক্ট পেজ অথবা ধন্যবাদ পেজ কিনা পরীক্ষা করা
  const isMinimal = pathname?.startsWith("/product") || pathname?.startsWith("/thank-you");

  // 🛍️ ১. প্রোডাক্ট এবং থ্যাংক ইউ পেজের জন্য স্লিম মিনিমাল হেডার
  if (isMinimal) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.9)] border-b border-white/10 bg-black/60 backdrop-blur-md py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* লোগো */}
          <Link
            href="/"
            className="font-serif text-base sm:text-xl font-black tracking-widest cursor-pointer flex items-center gap-1.5 select-none animate-text-shine text-amber-500"
          >
            <span>⚜</span> MAYABI BOUTIQUES
          </Link>

          {/* ট্রাস্ট নোট (ডেস্কটপে দেখাবে) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-amber-400/80 bg-black/40 px-3.5 py-1.5 rounded-full border border-amber-500/20">
            <span>🛡️ ১০০% অরিজিনাল কালেকশন</span>
            <span>•</span>
            <span>🚚 ক্যাশ অন ডেলিভারি</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <LanguageSwitcher />
            <AccountButton />
            <WishlistButton />
            <CartButton />
            {/* হোমে ফিরে যাওয়ার বাটন */}
            <Link
              href="/"
              className="text-xs sm:text-sm font-bold text-amber-400 hover:text-black bg-white/[0.04] hover:bg-amber-500 border border-amber-500/40 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5"
            >
              <span>←</span> হোমে ফিরে যান
            </Link>
          </div>
        </div>
      </header>
    );
  }

  // 🏠 ২. হোম পেজ ও অন্যান্য পেজের জন্য নতুন ও প্রফেশনাল হেডার
  return (
    <div className="fixed top-0 left-0 right-0 z-50 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 text-black text-center py-2 text-[10px] sm:text-sm font-bold tracking-wide px-2">
        &ldquo;আভিজাত্য রাঙাক আপনার উৎসব! আমাদের লাক্সারি কালেকশন থেকে সেরাটি বেছে নিন আজই।&rdquo;
      </div>

      <nav className="relative h-16 sm:h-20 flex items-center justify-between max-w-7xl mx-auto px-3 sm:px-4 w-full gap-2 md:gap-4">
        {/* ১. বাঁদিকে লোগো */}
        <div className="flex items-center gap-2 shrink-0">
          <MobileNav categories={categories} />
          <Link
            href="/"
            className="font-serif text-base sm:text-2xl font-black tracking-widest cursor-pointer flex items-center gap-1.5 sm:gap-2 select-none animate-text-shine text-amber-500"
          >
            <span>⚜</span> MAYABI BOUTIQUES
          </Link>
        </div>

        {/* ২. মাঝখানে প্রফেশনাল লাইভ সার্চ বার */}
        <div ref={searchRef} className="relative flex-1 max-w-[150px] sm:max-w-[280px] md:max-w-[380px] mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={t("search_placeholder")}
            className="w-full bg-black/40 text-gray-200 text-[11px] sm:text-xs rounded-full py-1.5 sm:py-2 pl-8 sm:pl-9 pr-3 border border-amber-500/30 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 placeholder-gray-500 transition-all"
          />
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* 📦 সার্চ রেজাল্ট ড্রপডাউন */}
          {isOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/[0.04] border border-amber-500/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-50 max-h-80 overflow-y-auto p-2 backdrop-blur-md">
              {filteredProducts.length > 0 ? (
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-amber-500/20 transition-all group"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-9 h-9 rounded-md object-cover border border-amber-500/30 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-200 truncate group-hover:text-amber-400 transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-amber-400 font-black">
                          {formatBDT(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center space-y-1 bg-white/[0.04] rounded-lg border border-amber-500/20">
                  <div className="text-xl">🔍</div>
                  <p className="text-xs font-bold text-gray-200">
                    ক্ষমা করবেন, কোনো পণ্য পাওয়া যায়নি!
                  </p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    আপনার খোঁজা পোশাকটি এই মুহূর্তে স্টকে নেই।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ৩. ডানপাশে কার্ট + নেভিগেশন মেনু + More (আরও) ড্রপডাউন (ডেস্কটপ) */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs uppercase tracking-widest font-semibold text-gray-300 shrink-0">
          <div className="hidden lg:flex items-center space-x-5">
            <Link href="/" className="hover:text-amber-400 transition-all">{t("nav_home")}</Link>
            <Link href="/#featured" className="hover:text-amber-400 transition-all">{t("nav_featured")}</Link>
            <Link href="/#pricing" className="hover:text-amber-400 transition-all">{t("nav_combo")}</Link>
            <Link href="/lookbook" className="hover:text-amber-400 transition-all">লুকবুক</Link>
            <Link href="/sale" className="text-red-400 font-bold hover:text-red-300 transition-all flex items-center gap-1">
              🔥 SALE
            </Link>
            <CategoryMegaMenu categories={categories} />

            {/* 🍔 More (আরও) ড্রপডাউন মেনু */}
            <div ref={moreMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1.5 hover:text-amber-400 transition-all text-amber-400 font-bold bg-white/[0.04] px-3 py-1.5 rounded-full border border-amber-500/30 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>More</span>
                <span className="text-[10px]">{isMoreOpen ? "▲" : "▼"}</span>
              </button>

              {/* ড্রপডাউন আইটেমসমূহ */}
              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white/[0.04] border border-amber-500/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] py-2 z-50 text-xs normal-case tracking-normal">
                  <Link
                    href="/#our-story"
                    onClick={() => setIsMoreOpen(false)}
                    className="block px-4 py-2.5 text-gray-200 hover:bg-[#1a1a18] hover:text-amber-400 transition-colors"
                  >
                    📖 আমাদের গল্প
                  </Link>
                  <Link
                    href="/#why-us"
                    onClick={() => setIsMoreOpen(false)}
                    className="block px-4 py-2.5 text-gray-200 hover:bg-[#1a1a18] hover:text-amber-400 transition-colors"
                  >
                    ⭐ কেন আমরা সেরা
                  </Link>
                  <Link
                    href="/#reviews"
                    onClick={() => setIsMoreOpen(false)}
                    className="block px-4 py-2.5 text-gray-200 hover:bg-[#1a1a18] hover:text-amber-400 transition-colors"
                  >
                    💬 গ্রাহকদের মন্তব্য
                  </Link>
                  <div className="border-t border-amber-500/15 my-1"></div>
                  <Link
                    href="/#footer"
                    onClick={() => setIsMoreOpen(false)}
                    className="block px-4 py-2.5 text-gray-200 hover:bg-[#1a1a18] hover:text-amber-400 transition-colors font-bold"
                  >
                    📞 যোগাযোগ
                  </Link>
                </div>
              )}
            </div>
          </div>

          <LanguageSwitcher className="hidden sm:flex" />
          <AccountButton className="hidden sm:flex" />
          <WishlistButton />
          <CartButton />
        </div>
      </nav>
    </div>
  );
}
