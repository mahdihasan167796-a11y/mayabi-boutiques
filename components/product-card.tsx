"use client";

import { useState } from "react";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { useI18n, localizedName } from "@/lib/i18n/context";
import { QuickViewModal } from "@/components/quick-view-modal";

export function ProductCard({ product }: { product: any }) {
  const { addItem, openCart } = useCart();
  const { locale, t } = useI18n();
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(String(product?.id));
  const [showQuickView, setShowQuickView] = useState(false);

  const productIdentifier = product?.slug || product?.id || "";
  const productImage = product?.images?.[0] || product?.image || "/placeholder.jpg";
  const secondaryImage = product?.images?.[1];
  const variantSwatches = Array.isArray(product?.variants) ? product.variants.slice(0, 4) : [];
  const extraVariantCount = Array.isArray(product?.variants) ? Math.max(0, product.variants.length - 4) : 0;
  const productName = localizedName(locale, product?.name || "প্রোডাক্ট", product?.name_en);
  const productPrice = product?.price || 0;
  const oldPrice = product?.oldPrice || product?.old_price;
  const hasDiscount = oldPrice && Number(oldPrice) > Number(productPrice);
  const discountPercent = hasDiscount ? Math.round(((Number(oldPrice) - Number(productPrice)) / Number(oldPrice)) * 100) : 0;
  const isLowStock =
    typeof product?.stock === "number" && product.stock > 0 && product.stock <= (product?.minStockAlert || 5);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      productId: String(product.id),
      slug: productIdentifier,
      name: productName,
      image: productImage,
      price: Number(productPrice),
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // কার্ডের Link-এ ক্লিক প্রোডাক্ট পেজে নিয়ে যাওয়া ঠেকানো
    e.stopPropagation();
    addItem({
      productId: String(product.id),
      slug: productIdentifier,
      name: productName,
      categorySlug: product?.categorySlug || product?.category_slug,
      image: productImage,
      unitPrice: Number(productPrice),
      quantity: 1,
    });
    openCart();
  };

  return (
    <>
    <Link
      href={`/product/${productIdentifier}`}
      className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-3 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.9)] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-amber-500/40 hover:shadow-amber-500/20"
    >
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-black mb-4">
        <img
          src={productImage}
          alt={productName}
          className={`w-full h-full object-cover transition-opacity duration-500 ease-out ${
            secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-105"
          }`}
        />
        {secondaryImage && (
          <img
            src={secondaryImage}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
          />
        )}

        <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md">
          {hasDiscount ? "Limited Edition" : "Exclusive"}
        </span>
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 mt-6 bg-red-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md">
            -{discountPercent}%
          </span>
        )}

        <button
          onClick={handleToggleWishlist}
          aria-label="উইশলিস্টে যোগ করুন"
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-500 ease-out ${
            wishlisted
              ? "bg-red-500/90 border-red-400 text-white"
              : "bg-black/50 border-white/20 text-white hover:bg-red-500/70 hover:border-red-400"
          }`}
        >
          {wishlisted ? "❤️" : "🤍"}
        </button>

        {isLowStock && (
          <span className="absolute top-11 right-2.5 bg-black/70 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
            মাত্র {product.stock}টি বাকি
          </span>
        )}

        {/* হোভার করলে কুইক-ভিউ ও কুইক-অ্যাড-টু-কার্ট বাটন ভেসে ওঠে */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowQuickView(true);
          }}
          aria-label="Quick View"
          className="absolute bottom-2.5 right-14 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-500 ease-out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button
          onClick={handleQuickAdd}
          aria-label="কার্টে যোগ করুন"
          className="absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all duration-500 ease-out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="17" cy="19" r="1.5" />
          </svg>
        </button>
      </div>

      <div>
        {(product?.categorySlug || product?.category_slug) && (
          <p className="text-[9px] uppercase tracking-wide text-gray-500 mb-1">
            {(product.categorySlug || product.category_slug).replace(/-/g, " ")}
          </p>
        )}
        <h4 className="font-medium text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors duration-500 line-clamp-1">
          {productName}
        </h4>

        {variantSwatches.length > 1 && (
          <div className="flex items-center gap-1.5 mt-2">
            {variantSwatches.map((v: any, idx: number) => (
              <span
                key={idx}
                className="w-5 h-5 rounded-full overflow-hidden border border-white/20 bg-black shrink-0"
                title={v?.name || v?.color || ""}
              >
                {v?.image && <img src={v.image} alt="" className="w-full h-full object-cover" />}
              </span>
            ))}
            {extraVariantCount > 0 && (
              <span className="text-[9px] text-gray-500">+{extraVariantCount}</span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10">
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm font-serif font-bold text-amber-400">{formatBDT(productPrice)}</p>
            {hasDiscount && <s className="text-[10px] text-gray-500">{formatBDT(oldPrice)}</s>}
          </div>
          <span className="text-[10px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/10">
            {t("btn_order_now")}
          </span>
        </div>
      </div>
    </Link>
    {showQuickView && <QuickViewModal product={product} onClose={() => setShowQuickView(false)} />}
    </>
  );
}