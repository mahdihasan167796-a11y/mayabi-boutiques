"use client";

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { formatBDT } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem, openCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <span className="text-5xl opacity-30">🤍</span>
        <p className="text-gray-400">আপনার উইশলিস্ট এখনো খালি — পছন্দের প্রোডাক্টে ❤️ চেপে যোগ করুন।</p>
        <Link
          href="/"
          className="text-sm text-amber-400 border border-amber-500/30 px-5 py-2.5 rounded-full hover:bg-amber-500 hover:text-black transition-all duration-500 ease-out"
        >
          কালেকশন দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-serif text-2xl font-bold text-white mb-8">🤍 আপনার উইশলিস্ট ({items.length})</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl overflow-hidden shadow-[0_20px_45px_-25px_rgba(0,0,0,0.9)]"
          >
            <button
              onClick={() => removeItem(item.productId)}
              aria-label="উইশলিস্ট থেকে সরান"
              className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              ✕
            </button>
            <Link href={`/product/${item.slug}`} className="block">
              <div className="h-56 w-full overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="p-3">
                <h4 className="text-xs sm:text-sm text-white line-clamp-1">{item.name}</h4>
                <p className="text-sm font-serif font-bold text-amber-400 mt-1">{formatBDT(item.price)}</p>
              </div>
            </Link>
            <div className="p-3 pt-0">
              <button
                onClick={() => {
                  addItem({
                    productId: item.productId,
                    slug: item.slug,
                    name: item.name,
                    image: item.image,
                    unitPrice: item.price,
                    quantity: 1,
                  });
                  openCart();
                }}
                className="w-full text-xs font-bold bg-white/[0.06] hover:bg-amber-500 hover:text-black text-amber-400 border border-amber-500/30 py-2.5 rounded-xl transition-all duration-500 ease-out"
              >
                কার্টে যোগ করুন
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
