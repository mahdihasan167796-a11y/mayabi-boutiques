"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatBDT, engToBdNum } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useI18n, localizedName } from "@/lib/i18n/context";

export function QuickViewModal({ product, onClose }: { product: any; onClose: () => void }) {
  const { addItem, openCart } = useCart();
  const { locale, t } = useI18n();

  const productIdentifier = product?.slug || product?.id || "";
  const productName = localizedName(locale, product?.name || "প্রোডাক্ট", product?.name_en);
  const images: string[] = Array.isArray(product?.images) ? product.images : [product?.image].filter(Boolean);
  const sizes: string[] = Array.isArray(product?.sizes) ? product.sizes : [];
  const variants: any[] = Array.isArray(product?.variants) ? product.variants : [];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(variants[0]?.name || "");
  const [quantity, setQuantity] = useState(1);

  const currentVariant = variants.find((v) => v.name === selectedColor);
  const price = currentVariant?.price ?? product?.price ?? 0;
  const stock = typeof product?.stock === "number" ? product.stock : 99;

  const handleAdd = () => {
    addItem({
      productId: String(product.id),
      slug: productIdentifier,
      name: productName,
      categorySlug: product?.categorySlug || product?.category_slug,
      image: currentVariant?.image || images[activeImage] || images[0],
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      unitPrice: Number(price),
      quantity,
    });
    openCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative bg-gradient-to-b from-[#151311] to-[#0c0b0a] border border-white/10 rounded-3xl shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] w-full max-w-2xl max-h-[88vh] overflow-y-auto grid sm:grid-cols-2 gap-0">
        <button
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
        >
          ✕
        </button>

        <div className="p-4">
          <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-white/10">
            <img src={images[activeImage]} alt={productName} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden border ${
                    activeImage === idx ? "border-amber-500" : "border-white/10"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 pt-8 sm:pt-5 flex flex-col">
          <h3 className="font-serif text-lg font-bold text-white mb-2">{productName}</h3>
          <p className="text-xl font-serif font-bold text-amber-400 mb-4">{formatBDT(price)}</p>

          {variants.length > 1 && (
            <div className="mb-4">
              <p className="text-[11px] text-gray-400 mb-1.5">{t("product_color")}</p>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.name}
                    onClick={() => setSelectedColor(v.name)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 ${
                      selectedColor === v.name ? "border-amber-500" : "border-white/15"
                    }`}
                  >
                    {v.image && <img src={v.image} alt="" className="w-full h-full object-cover" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] text-gray-400 mb-1.5">{t("product_size")}</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold border ${
                      selectedSize === s ? "bg-amber-500 text-black border-amber-500" : "border-white/15 text-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-5">
            <p className="text-[11px] text-gray-400 mb-1.5">{t("product_quantity")}</p>
            <div className="flex items-center w-28 bg-black/40 border border-white/10 rounded-lg p-1">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-7 h-7 text-gray-400 hover:text-amber-400">
                −
              </button>
              <span className="flex-1 text-center text-sm font-bold text-white">{engToBdNum(quantity)}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                className="w-7 h-7 text-gray-400 hover:text-amber-400"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={stock <= 0}
            className="w-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 disabled:opacity-50 text-black font-bold py-3 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55)] transition-all duration-500 ease-out mb-2"
          >
            {stock <= 0 ? t("product_out_of_stock") : t("btn_add_to_cart")}
          </button>
          <Link
            href={`/product/${productIdentifier}`}
            onClick={onClose}
            className="text-center text-xs text-gray-400 hover:text-amber-400 underline transition-colors"
          >
            পুরো ডিটেইলস দেখুন →
          </Link>
        </div>
      </div>
    </div>
  );
}
