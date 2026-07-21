"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { MobileNav } from "@/components/mobile-nav";
import { formatBDT } from "@/lib/utils";

interface Product {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  price: number;
  images: string[];
}

export function SiteHeader({ products = [] }: { products?: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>(products);
  const searchRef = useRef<HTMLDivElement>(null);

  // যদি সরাসরি প্রোপসে প্রোডাক্ট না আসে তবে এপিআই থেকে লোড করে নেওয়া
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

  // কাস্টমার যা টাইপ করবে তা দিয়ে নাম ও ক্যাটাগরি ফিল্টার করা
  const filteredProducts = searchQuery.trim() === ""
    ? []
    : allProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category_slug.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // সার্চ বারের বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হয়ে যাওয়া
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border-b border-[#c9a054]/15 bg-[#070706]/95 backdrop-blur-md">
      <div className="bg-gradient-to-r from-[#8a6829] via-[#c9a054] to-[#8a6829] text-black text-center py-2 text-[10px] sm:text-sm font-bold tracking-wide px-2">
        &ldquo;আভিজাত্য রাঙাক আপনার উৎসব! আমাদের লাক্সারি কালেকশন থেকে সেরাটি বেছে নিন আজই।&rdquo;
      </div>

      <nav className="relative h-16 sm:h-20 flex items-center justify-between max-w-7xl mx-auto px-3 sm:px-4 w-full gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <MobileNav />
          <Link
            href="/"
            className="text-base sm:text-2xl font-black tracking-widest cursor-pointer flex items-center gap-1.5 sm:gap-2 select-none animate-text-shine"
          >
            <span>⚜</span> MAYABI BOUTIQUES
          </Link>
        </div>

        <div className="hidden lg:flex space-x-6 text-xs uppercase tracking-widest font-semibold text-gray-300">
          <Link href="/" className="hover:text-[#c9a054] transition-all">হোম</Link>
          <Link href="/#featured" className="hover:text-[#c9a054] transition-all">ফিচারড কালেকশন</Link>
          <Link href="/#our-story" className="hover:text-[#c9a054] transition-all">আমাদের গল্প</Link>
          <Link href="/#why-us" className="hover:text-[#c9a054] transition-all">কেন আমরা সেরা</Link>
          <Link href="/#reviews" className="hover:text-[#c9a054] transition-all">গ্রাহকদের মন্তব্য</Link>
          <Link href="/#pricing" className="hover:text-[#c9a054] transition-all">কম্বো প্যাকেজ</Link>
          <Link href="/#footer" className="hover:text-[#c9a054] transition-all">যোগাযোগ</Link>
        </div>

        {/* 🔍 প্রফেশনাল লাইভ সার্চ বার ও রেজাল্ট বক্স */}
        <div ref={searchRef} className="relative flex-1 max-w-[160px] sm:max-w-[220px] lg:max-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="পণ্য খুঁজুন..."
            className="w-full bg-[#141413] text-gray-200 text-[11px] sm:text-xs rounded-full py-1.5 sm:py-2 pl-8 sm:pl-9 pr-3 border border-[#c9a054]/30 focus:border-[#c9a054] focus:outline-none focus:ring-1 focus:ring-[#c9a054] placeholder-gray-500 transition-all"
          />
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a054] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
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

          {/* 📦 সার্চ রেজাল্ট অথবা বিনয়ী পপ-আপ মেসেজ বক্স */}
          {isOpen && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 sm:w-[280px] sm:-left-12 mt-2 bg-[#121211] border border-[#c9a054]/40 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] z-50 max-h-80 overflow-y-auto p-2 backdrop-blur-md">
              {filteredProducts.length > 0 ? (
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#1f1f1d] border border-transparent hover:border-[#c9a054]/20 transition-all group"
                    >
                      <img
                        src={product.images?.[0] || "/placeholder.jpg"}
                        alt={product.name}
                        className="w-9 h-9 rounded-md object-cover border border-[#c9a054]/30 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-gray-200 truncate group-hover:text-[#c9a054] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-[#c9a054] font-black">
                          {formatBDT(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* পণ্য না পাওয়া গেলে প্রফেশনাল বিনয়ী বার্তা */
                <div className="p-4 text-center space-y-1 bg-[#181817] rounded-lg border border-[#c9a054]/20">
                  <div className="text-xl">🔍</div>
                  <p className="text-xs font-bold text-gray-200">
                    ক্ষমা করবেন, কোনো পণ্য পাওয়া যায়নি!
                  </p>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    আপনার খোঁজা পোশাকটি এই মুহূর্তে স্টকে নেই। অন্য নামে অথবা ক্যাটাগরি দিয়ে চেষ্টা করুন।
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="bg-[#111110] py-3 border-t border-[#c9a054]/10">
        <div
          className="max-w-7xl mx-auto px-4 flex space-x-3 overflow-x-auto scrollbar-none pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap border transition-all bg-[#181817] text-[#b5af9f] border-[#c9a054]/15 hover:border-[#c9a054]/40 hover:bg-[#c9a054] hover:text-black hover:font-bold shrink-0"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}