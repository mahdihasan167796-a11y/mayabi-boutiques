"use client";

import React from "react";
import Link from "next/link";
import { useCart, itemKey } from "@/lib/cart-context";
import { formatBDT, engToBdNum } from "@/lib/utils";

export function CartDrawer({ freeShippingThreshold = 0 }: { freeShippingThreshold?: number }) {
  const { items, isOpen, closeCart, removeItem, updateQuantity, itemCount, subtotal } = useCart();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress =
    freeShippingThreshold > 0 ? Math.min(100, (subtotal / freeShippingThreshold) * 100) : 0;

  return (
    <>
      {/* ব্যাকড্রপ */}
      <div
        onClick={closeCart}
        aria-hidden="true"
        className={`fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ড্রয়ার প্যানেল */}
      <aside
        className={`fixed top-0 right-0 z-[101] h-full w-full max-w-md bg-[#0c0c0c] border-l border-white/10 shadow-[-30px_0_60px_-30px_rgba(0,0,0,0.9)] transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="font-serif text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <span className="text-amber-400">⚜</span> আপনার কার্ট
            {itemCount > 0 && (
              <span className="text-[10px] font-bold text-black bg-gradient-to-r from-amber-400 to-amber-600 rounded-full px-2 py-0.5">
                {engToBdNum(itemCount)}
              </span>
            )}
          </h2>
          <button
            onClick={closeCart}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors duration-300"
          >
            ✕
          </button>
        </div>

        {freeShippingThreshold > 0 && items.length > 0 && (
          <div className="px-5 pt-4 pb-1 shrink-0">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[11px] text-gray-400 mb-2">
                আরও <span className="text-amber-400 font-bold">{formatBDT(remainingForFreeShipping)}</span> কিনলেই{" "}
                <span className="text-amber-400 font-bold">ফ্রি ডেলিভারি!</span>
              </p>
            ) : (
              <p className="text-[11px] text-green-400 mb-2 font-bold">🎉 আপনি ফ্রি ডেলিভারি পাচ্ছেন!</p>
            )}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-3">
              <span className="text-4xl opacity-40">🛍️</span>
              <p className="text-sm text-gray-500">আপনার কার্ট এখনো খালি</p>
              <button
                onClick={closeCart}
                className="text-xs text-amber-400 border border-amber-500/30 px-4 py-2 rounded-full hover:bg-amber-500 hover:text-black transition-all duration-500 ease-out"
              >
                কালেকশন দেখুন
              </button>
            </div>
          ) : (
            items.map((item) => {
              const key = itemKey(item);
              return (
                <div
                  key={key}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-3"
                >
                  <div className="w-16 h-20 rounded-xl overflow-hidden bg-black shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-medium text-white line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {[item.color, item.size].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-full px-1">
                        <button
                          onClick={() => updateQuantity(key, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors"
                          aria-label="কমান"
                        >
                          −
                        </button>
                        <span className="text-xs font-bold text-white w-4 text-center">
                          {engToBdNum(item.quantity)}
                        </span>
                        <button
                          onClick={() => updateQuantity(key, item.quantity + 1)}
                          disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-amber-400 disabled:opacity-30 transition-colors"
                          aria-label="বাড়ান"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs font-serif font-bold text-amber-400">
                        {formatBDT(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(key)}
                    aria-label="সরিয়ে ফেলুন"
                    className="text-gray-600 hover:text-red-400 transition-colors self-start"
                  >
                    ✕
                  </button>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4 space-y-3 bg-[#0c0c0c] shrink-0">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">সাবটোটাল</span>
              <span className="font-serif font-black text-white text-base">{formatBDT(subtotal)}</span>
            </div>
            <p className="text-[10px] text-gray-500">ডেলিভারি চার্জ ও কুপন ছাড় চেকআউট পেজে হিসাব হবে।</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black font-bold text-sm py-3.5 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55),0_0_46px_-6px_rgba(245,158,11,0.65)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7),0_0_64px_-4px_rgba(245,158,11,0.9)] hover:-translate-y-0.5 transition-all duration-500 ease-out"
            >
              চেকআউটে যান
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
