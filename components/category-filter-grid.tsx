"use client";

import React, { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { formatBDT } from "@/lib/utils";

type SortOption = "default" | "price-asc" | "price-desc" | "newest";

export function CategoryFilterGrid({ products }: { products: any[] }) {
  const priceBounds = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 10000 };
    const prices = products.map((p) => Number(p.price) || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  // সব প্রোডাক্ট মিলিয়ে যতগুলো ইউনিক সাইজ পাওয়া যায় (নিজস্ব sizes অ্যারে অথবা variants থেকে)
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      (p.sizes || []).forEach((s: string) => set.add(s));
    });
    return Array.from(set).sort();
  }, [products]);

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  const filtered = useMemo(() => {
    let list = [...products];

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if (min !== null) list = list.filter((p) => Number(p.price) >= min);
    if (max !== null) list = list.filter((p) => Number(p.price) <= max);

    if (selectedSizes.length > 0) {
      list = list.filter((p) => (p.sizes || []).some((s: string) => selectedSizes.includes(s)));
    }

    if (inStockOnly) {
      list = list.filter((p) => Number(p.stock ?? 0) > 0);
    }

    if (sortBy === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === "newest")
      list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return list;
  }, [products, minPrice, maxPrice, sortBy, selectedSizes, inStockOnly]);

  const hasActiveFilter =
    minPrice !== "" || maxPrice !== "" || sortBy !== "default" || selectedSizes.length > 0 || inStockOnly;

  return (
    <div>
      {/* ফিল্টার বার */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-4 mb-8 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-400 shrink-0">💰 প্রাইস রেঞ্জ:</span>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder={`সর্বনিম্ন (${formatBDT(priceBounds.min)})`}
            className="w-28 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
          />
          <span className="text-gray-600">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder={`সর্বোচ্চ (${formatBDT(priceBounds.max)})`}
            className="w-28 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
          />

          <span className="text-xs font-bold text-gray-400 shrink-0 ml-2">সাজান:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
          >
            <option value="default">প্রাসঙ্গিকতা</option>
            <option value="newest">নতুন প্রথমে</option>
            <option value="price-asc">দাম: কম থেকে বেশি</option>
            <option value="price-desc">দাম: বেশি থেকে কম</option>
          </select>

          <label className="flex items-center gap-1.5 text-xs text-gray-300 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-amber-500"
            />
            শুধু স্টকে থাকা
          </label>

          {hasActiveFilter && (
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setSortBy("default");
                setSelectedSizes([]);
                setInStockOnly(false);
              }}
              className="text-xs text-amber-400 underline ml-auto"
            >
              ফিল্টার মুছুন
            </button>
          )}
          <span className="text-[11px] text-gray-500 ml-auto sm:ml-0">{filtered.length}টি প্রোডাক্ট</span>
        </div>

        {availableSizes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
            <span className="text-xs font-bold text-gray-400 shrink-0">📏 সাইজ:</span>
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold border transition-all duration-300 ${
                  selectedSizes.includes(size)
                    ? "bg-amber-500 text-black border-amber-500"
                    : "border-white/15 text-gray-300 hover:border-amber-500/40"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-24">এই ফিল্টারে কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
