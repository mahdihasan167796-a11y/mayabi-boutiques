// @ts-nocheck
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { engToBdNum, formatBDT } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/lib/cart-context";
import { SizeGuideModal } from "@/components/size-guide-modal";
import { DeliveryChecker } from "@/components/delivery-checker";

type VariantType = {
  name: string;
  image?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
};

export default function ProductDetailClient({
  product,
  reviews = [],
  relatedProducts = [],
  deliveryZones = [],
}: {
  product: any;
  reviews?: any[];
  relatedProducts?: any[];
  deliveryZones?: any[];
}) {
  const router = useRouter();
  const { addItem, clearCart } = useCart();

  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeRelatedProducts = Array.isArray(relatedProducts) ? relatedProducts : [];

  const [selectedColor, setSelectedColor] = useState(product.variants?.[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  // রিভিউ ফর্মের জন্য স্টেট
  const [reviewName, setReviewName] = useState("");
  const [reviewLocation, setReviewLocation] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [openInfoSection, setOpenInfoSection] = useState<string | null>("description");
  const [showReviewsList, setShowReviewsList] = useState(false);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewLoading(true);
    setReviewSuccess("");

    const formData = new FormData();
    formData.append("product_id", product.id);
    formData.append("customer_name", reviewName);
    formData.append("location", reviewLocation);
    formData.append("rating", String(reviewRating));
    formData.append("comment", reviewComment);
    if (reviewImage) formData.append("image", reviewImage);

    try {
      const res = await fetch("/api/reviews", { method: "POST", body: formData });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        alert("রিভিউ সাবমিট করতে সমস্যা হয়েছে: " + (result.error || ""));
      } else {
        setReviewSuccess("আপনার রিভিউটি সফলভাবে পাঠানো হয়েছে!");
        setReviewName("");
        setReviewLocation("");
        setReviewRating(5);
        setReviewComment("");
        setReviewImage(null);
        setReviewImagePreview(null);
      }
    } catch {
      alert("নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setReviewLoading(false);
    }
  };

  const currentVariant = (product.variants as VariantType[])?.find((v) => v.name === selectedColor);
  const currentPrice = currentVariant?.price ?? product.price;
  const currentOldPrice = currentVariant?.oldPrice ?? product.oldPrice;

  const currentStock =
    currentVariant && typeof currentVariant.stock === "number" ? currentVariant.stock : Number(product.stock ?? 0);

  const isOutOfStock = isNaN(currentStock) || currentStock <= 0;

  // স্টক আর্জেন্সি ব্যাজ — প্রোডাক্টের নিজস্ব minStockAlert থাকলে সেটাই থ্রেশহোল্ড, না থাকলে ডিফল্ট ৫
  const lowStockThreshold = Number(product.minStockAlert || 5);
  const isLowStock = !isOutOfStock && currentStock <= lowStockThreshold;

  const buildCartItem = () => ({
    productId: String(product.id),
    slug: product.slug || String(product.id),
    name: product.name,
    categorySlug: product.categorySlug || product.category_slug,
    image: currentVariant?.image || product.images?.[activeImageIdx] || product.images?.[0],
    color: selectedColor || undefined,
    size: selectedSize || undefined,
    unitPrice: currentPrice,
    quantity,
    maxStock: isNaN(currentStock) ? undefined : currentStock,
  });

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(buildCartItem());
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    clearCart();
    addItem(buildCartItem());
    router.push("/checkout");
  };

  return (
    <div className="px-4 md:px-8 pt-0 pb-6 flex flex-col items-center justify-start font-sans relative">
      <div className="max-w-6xl w-full bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="pt-2 px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div
              className="overflow-hidden rounded-xl bg-black border border-amber-500/10 aspect-square flex items-center justify-center relative cursor-zoom-in"
              onMouseEnter={() => setZoomActive(true)}
              onMouseLeave={() => setZoomActive(false)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setZoomPosition({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                });
              }}
            >
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-200 ease-out hidden sm:block"
                style={
                  zoomActive
                    ? { transform: "scale(2)", transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                    : undefined
                }
              />
              <img
                src={product.images[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover sm:hidden"
              />
              {isOutOfStock && (
                <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg backdrop-blur-sm">
                  Out of Stock (স্টক শেষ)
                </div>
              )}
              {isLowStock && (
                <div className="absolute top-4 right-4 bg-[#7a121d] text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg backdrop-blur-sm animate-pulse">
                  ⚡ মাত্র {engToBdNum(currentStock)}টি বাকি!
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 h-16 rounded-lg border overflow-hidden cursor-pointer transition-all shrink-0 ${
                    activeImageIdx === idx ? "border-amber-500/40 ring-2 ring-amber-500/30" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h1 className="font-serif text-xl md:text-2xl font-bold leading-snug text-white">{product.name}</h1>

              <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-gray-400">
                <span className="text-amber-400">★★★★☆</span>
                <span className="text-amber-400">রেটিং {engToBdNum(product.rating || 5)}</span>
                <span>|</span>
                <span className="text-amber-400">{engToBdNum(product.questions || 0)}টি প্রশ্ন উত্তর</span>
              </div>
              <div className="mt-1 text-xs text-gray-500">ব্র্যান্ড: MAYABI BOUTIQUES | আইডি: {product.id}</div>

              <hr className="my-4 border-white/10" />

              <div className="bg-black/40 p-4 rounded-xl border border-white/10">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-amber-400">{formatBDT(currentPrice)}</span>
                  {currentOldPrice && (
                    <span className="text-sm line-through text-gray-500">{formatBDT(currentOldPrice)}</span>
                  )}
                  {currentOldPrice && currentOldPrice > currentPrice && (
                    <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded font-bold">
                      -{Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  স্টক অবস্থা:{" "}
                  {isOutOfStock ? (
                    <span className="text-red-500 font-bold">স্টক শেষ (Out of Stock)</span>
                  ) : isLowStock ? (
                    <span className="text-[#e0a840] font-bold">⚡ মাত্র {engToBdNum(currentStock)}টি বাকি — দ্রুত অর্ডার করুন!</span>
                  ) : (
                    <span className="text-green-400 font-bold">স্টকে আছে ({engToBdNum(currentStock)}টি)</span>
                  )}
                </p>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm text-gray-400 mb-2">
                    Color Family: <span className="text-white font-bold">{selectedColor}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <button
                        key={v.name}
                        onClick={() => {
                          setSelectedColor(v.name ?? "");
                          setActiveImageIdx(0);
                        }}
                        className={`p-1 rounded-lg border transition-all flex items-center justify-center ${
                          selectedColor === v.name
                            ? "border-amber-500/40 ring-2 ring-amber-500/20 bg-amber-500/10"
                            : "border-white/10 bg-black/40 hover:border-white/20"
                        }`}
                      >
                        <img src={v.image || product.images[0]} alt="" className="w-10 h-10 object-cover rounded-md" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-400">
                      Size: <span className="text-white font-bold">{selectedSize}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[11px] font-bold text-amber-400 underline underline-offset-2"
                    >
                      📏 Size Chart
                    </button>
                  </div>
                  <div className="flex gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 text-sm font-bold rounded-lg border transition-all ${
                          selectedSize === size
                            ? "border-amber-500/40 bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20"
                            : "border-white/10 bg-black/40 text-gray-300 hover:border-white/20"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-sm text-gray-400 mb-2">পরিমাণ (Quantity)</h3>
                <div className="flex items-center w-32 bg-black/40 border border-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-400 hover:bg-white/10 rounded transition-all disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-sm font-bold text-white">{engToBdNum(quantity)}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    disabled={isOutOfStock || quantity >= currentStock}
                    className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-400 hover:bg-white/10 rounded transition-all disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 hover:brightness-110 disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-extrabold py-3.5 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55)] transition-all duration-500 ease-out active:scale-[0.98]"
              >
                {isOutOfStock ? "Out of Stock" : "এখনই কিনুন (Buy Now)"}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-white/[0.06] hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-amber-400 border border-amber-500/40 font-bold py-3.5 rounded-2xl transition-all duration-500 ease-out"
              >
                {isOutOfStock ? "স্টক শেষ" : justAdded ? "✓ কার্টে যোগ হয়েছে" : "কার্টে যোগ করুন"}
              </button>
            </div>

            <DeliveryChecker zones={deliveryZones} />
          </div>
        </div>
      </div>

      {/* ০. প্রোডাক্ট ইনফো অ্যাকর্ডিয়ন (Description / Fabric Care / Shipping) */}
      <div className="max-w-4xl w-full mx-auto mt-10 space-y-3 px-4">
        {[
          {
            key: "description",
            title: "📝 প্রোডাক্ট বিবরণ",
            content:
              product.description && product.description.trim()
                ? product.description
                : "এই প্রোডাক্টটি প্রিমিয়াম মানের ফেব্রিক দিয়ে তৈরি, আরামদায়ক ফিট এবং দীর্ঘস্থায়ী ফিনিশিং নিশ্চিত করে। প্রতিটি পিস সতর্কতার সাথে পরীক্ষা করে প্যাকেজিং করা হয়।",
          },
          {
            key: "fabric",
            title: "🧵 ফেব্রিক ও যত্নের নির্দেশনা",
            content:
              "হালকা গরম পানিতে হাত দিয়ে ধোয়া ভালো, ব্লিচ ব্যবহার এড়িয়ে চলুন। রোদে সরাসরি না শুকিয়ে ছায়ায় শুকান। ইস্ত্রি করার সময় কাপড়ের উল্টো পাশে করুন যাতে প্রিন্ট/এমব্রয়ডারি অক্ষত থাকে।",
          },
          {
            key: "shipping",
            title: "🚚 শিপিং ও রিটার্ন",
            content:
              "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা আছে — সাধারণত ঢাকায় ২-৩ ও ঢাকার বাইরে ৩-৫ কার্যদিবস সময় লাগে। পণ্য পছন্দ না হলে ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ করা যাবে (বিস্তারিত রিফান্ড/রিটার্ন পলিসিতে)।",
          },
        ].map((section) => (
          <div
            key={section.key}
            className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenInfoSection(openInfoSection === section.key ? null : section.key)}
              className="w-full flex items-center justify-between text-left px-5 py-3.5 text-sm font-bold text-white hover:text-amber-400 transition-colors duration-300"
            >
              <span>{section.title}</span>
              <span
                className={`text-amber-400 text-xs transition-transform duration-300 ${
                  openInfoSection === section.key ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>
            {openInfoSection === section.key && (
              <div className="px-5 pb-4 text-xs text-gray-400 leading-relaxed">{section.content}</div>
            )}
          </div>
        ))}
      </div>

      {/* ১. আপনাদের পছন্দের আরও কিছু কালেকশন (Related Products) */}
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-amber-400 mb-6 text-center">
          ✨ আপনাদের পছন্দের আরও কিছু কালেকশন
        </h2>

        {safeRelatedProducts && safeRelatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {safeRelatedProducts.map((relProduct: any) => {
              const relImg = Array.isArray(relProduct.images) ? relProduct.images[0] : relProduct.image;
              const relSlug = relProduct.slug || relProduct.id;
              return (
                <Link
                  key={relProduct.id}
                  href={`/product/${relSlug}`}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-500 ease-out"
                >
                  <div className="aspect-square bg-gray-900 overflow-hidden relative">
                    <img
                      src={relImg}
                      alt={relProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 md:p-4 flex flex-col flex-1 justify-between">
                    <h3 className="text-xs md:text-sm font-semibold text-gray-200 line-clamp-2 mb-2 group-hover:text-amber-400">
                      {relProduct.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/[0.03] border border-white/10 rounded-2xl">
            <p className="text-gray-400 text-sm md:text-base">😔 এই মুহূর্তে কোনো সম্পর্কিত প্রোডাক্ট খুঁজে পাওয়া যায়নি।</p>
          </div>
        )}
      </div>

      {/* ২. রিভিউ সেকশন */}
      <div className="max-w-4xl w-full mx-auto mt-12 space-y-4 px-4">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="w-full p-4 flex justify-between items-center text-left text-amber-400 font-bold text-lg hover:bg-white/[0.04] transition duration-200 cursor-pointer"
          >
            <span>✍️ এই প্রোডাক্ট সম্পর্কে আপনার মতামত জানান</span>
            <span className="text-xl">{showWriteReview ? "▲" : "▼"}</span>
          </button>

          {showWriteReview && (
            <div className="p-6 border-t border-amber-500/20 text-white">
              {reviewSuccess && (
                <div className="mb-4 p-3 bg-green-500/20 border border-green-500 text-green-300 rounded-lg text-sm">
                  {reviewSuccess}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">আপনার নাম</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="যেমন: ফারজানা রহমান"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">আপনার এলাকা / শহর</label>
                    <input
                      type="text"
                      required
                      value={reviewLocation}
                      onChange={(e) => setReviewLocation(e.target.value)}
                      placeholder="যেমন: ঢাকা"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">রেটিং (১ থেকে ৫)</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (৫ স্টার)</option>
                    <option value={4}>⭐⭐⭐⭐ (৪ স্টার)</option>
                    <option value={3}>⭐⭐⭐ (৩ স্টার)</option>
                    <option value={2}>⭐⭐ (২ স্টার)</option>
                    <option value={1}>⭐ (১ স্টার)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">আপনার মন্তব্য / রিভিউ</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="প্রোডাক্টটি কেমন লেগেছে বিস্তারিত লিখুন..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">ছবি যোগ করুন (ঐচ্ছিক)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setReviewImage(file);
                      setReviewImagePreview(file ? URL.createObjectURL(file) : null);
                    }}
                    className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500/15 file:text-amber-400 file:text-xs file:font-bold"
                  />
                  {reviewImagePreview && (
                    <div className="relative w-20 h-20 mt-2">
                      <img src={reviewImagePreview} alt="" className="w-full h-full object-cover rounded-lg border border-white/10" />
                      <button
                        type="button"
                        onClick={() => { setReviewImage(null); setReviewImagePreview(null); }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-black rounded-full text-red-400 text-[10px] border border-white/20"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-3 rounded-2xl hover:brightness-110 transition duration-200 cursor-pointer disabled:opacity-50"
                >
                  {reviewLoading ? "সাবমিট হচ্ছে..." : "রিভিউ জমা দিন"}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowReviewsList(!showReviewsList)}
            className="w-full p-4 flex justify-between items-center text-left text-white font-bold text-lg hover:bg-white/[0.04] transition duration-200 cursor-pointer"
          >
            <span>⭐ গ্রাহকদের রিভিউ ({safeReviews.length})</span>
            <span className="text-xl">{showReviewsList ? "▲" : "▼"}</span>
          </button>

          {showReviewsList && (
            <div className="p-6 border-t border-amber-500/20 space-y-4">
              {safeReviews.length === 0 ? (
                <p className="text-gray-400 text-sm">এই প্রোডাক্টে এখনো কোনো রিভিউ নেই।</p>
              ) : (
                safeReviews.map((rev: any, index: number) => (
                  <div key={index} className="bg-white/[0.04] p-4 rounded-2xl border border-white/10 text-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm">{rev.name || rev.customer_name || "গ্রাহক"}</span>
                      <span className="text-amber-400 text-xs">{"★".repeat(Number(rev.rating) || 5)}</span>
                    </div>
                    <p className="text-gray-300 text-sm">{rev.comment || rev.review}</p>
                    {rev.image_url && (
                      <img src={rev.image_url} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10 mt-2" />
                    )}
                    <span className="text-gray-500 text-xs mt-1 block">{rev.city || rev.location || ""}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <SizeGuideModal open={showSizeGuide} onClose={() => setShowSizeGuide(false)} />
    </div>
  );
}
