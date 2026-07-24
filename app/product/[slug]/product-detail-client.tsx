"use client";

import React, { useState } from "react";
import { Product } from "@/lib/products";
import { engToBdNum, formatBDT } from "@/lib/utils";

// ভ্যারিয়েন্ট টাইপ ডিফাইন (যদি আলাদা দাম বা স্টক থাকে)
type VariantType = {
  name: string;
  image?: string;
  price?: number;
  oldPrice?: number;
  stock?: number;
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [currentStep, setCurrentStep] = useState<0 | 1>(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    region: "",
    city: "",
    area: "",
    address: "",
    label: "HOME",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad">("cod");
  const [transactionId, setTransactionId] = useState("");

  const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01700-000000";
  const NAGAD_NUMBER = process.env.NEXT_PUBLIC_NAGAD_NUMBER || "01700-000000";

  // 🔹 সিলেক্ট করা ভ্যারিয়েন্ট অনুযায়ী ডাইনামিক প্রাইস ও স্টক গণনা (Default fallback correct logic)
  const currentVariant = (product.variants as VariantType[])?.find((v) => v.name === selectedColor);
  const currentPrice = currentVariant?.price ?? product.price;
  const currentOldPrice = currentVariant?.oldPrice ?? product.oldPrice;
  const currentStock = currentVariant?.stock ?? product.stock ?? 0;
  const isOutOfStock = currentStock <= 0;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (isOutOfStock) {
      setSubmitError("দুঃখিত, এই প্রোডাক্টটি বর্তমানে স্টক আউট রয়েছে।");
      return;
    }

    if (paymentMethod !== "cod" && !transactionId.trim()) {
      setSubmitError("বিকাশ/নগদ-এ সেন্ড মানি করার পর ট্রানজেকশন আইডি দিন।");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          categorySlug: product.categorySlug,
          color: selectedColor,
          size: selectedSize,
          quantity,
          unitPrice: currentPrice,
          totalPrice: currentPrice * quantity,
          customerName: formData.fullName,
          phone: formData.phoneNumber,
          region: formData.region,
          city: formData.city,
          area: formData.area,
          address: formData.address,
          addressLabel: formData.label,
          paymentMethod,
          transactionId: paymentMethod !== "cod" ? transactionId.trim() : undefined,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.ok) {
        setSubmitError(result.error || "অর্ডার সেভ করা যায়নি, একটু পরে আবার চেষ্টা করুন।");
        return;
      }

      setShowThankYou(true);
    } catch {
      setSubmitError("ইন্টারনেট সংযোগে সমস্যা হয়েছে, একটু পরে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-8 flex justify-center items-start font-sans relative">
      <div className="max-w-6xl w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {currentStep === 0 && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* বাম পাশ: প্রোডাক্ট ইমেজ */}
            <div>
              <div className="overflow-hidden rounded-xl bg-neutral-800 border border-neutral-700 aspect-square flex items-center justify-center relative">
                <img src={product.images[activeImageIdx]} alt={product.name} className="w-full h-full object-cover" />
                {isOutOfStock && (
                  <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg backdrop-blur-sm">
                    Out of Stock (স্টক শেষ)
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-lg border overflow-hidden cursor-pointer transition-all shrink-0 ${
                      activeImageIdx === idx ? "border-amber-500 ring-2 ring-amber-500/30" : "border-neutral-700 hover:border-neutral-500"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* ডান পাশ: কাস্টমাইজেশন */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold leading-snug text-neutral-100">{product.name}</h1>

                <div className="flex items-center gap-2 mt-2 text-xs md:text-sm text-neutral-400">
                  <span className="text-amber-500">★★★★☆</span>
                  <span className="text-amber-400">রেটিং {engToBdNum(product.rating)}</span>
                  <span>|</span>
                  <span className="text-amber-400">{engToBdNum(product.questions)}টি প্রশ্ন উত্তর</span>
                </div>
                <div className="mt-1 text-xs text-neutral-500">ব্র্যান্ড: MAYABI BOUTIQUES | আইডি: {product.id}</div>

                <hr className="my-4 border-neutral-800" />

                {/* 🔹 প্রাইস ডিসপ্লে */}
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-amber-500">{formatBDT(currentPrice)}</span>
                    {currentOldPrice && (
                      <span className="text-sm line-through text-neutral-500">{formatBDT(currentOldPrice)}</span>
                    )}
                    {currentOldPrice && currentOldPrice > currentPrice && (
                      <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded font-bold">
                        -{Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">
                    স্টক অবস্থা: {isOutOfStock ? <span className="text-red-500 font-bold">স্টক শেষ</span> : <span className="text-green-400 font-bold">স্টকে আছে ({engToBdNum(currentStock)}টি)</span>}
                  </p>
                </div>

                {/* Color */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm text-neutral-400 mb-2">Color Family: <span className="text-white font-bold">{selectedColor}</span></h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.name}
                         onClick={() => { setSelectedColor(v.name ?? ""); setActiveImageIdx(0); }}
                          className={`p-1 rounded-lg border transition-all flex items-center justify-center ${
                            selectedColor === v.name ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/10" : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                          }`}
                        >
                          <img src={v.image || product.images[0]} alt="" className="w-10 h-10 object-cover rounded-md" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm text-neutral-400 mb-2">Size: <span className="text-white font-bold">{selectedSize}</span></h3>
                    <div className="flex gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-12 text-sm font-bold rounded-lg border transition-all ${
                            selectedSize === size ? "border-amber-500 bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="mt-6">
                  <h3 className="text-sm text-neutral-400 mb-2">পরিমাণ (Quantity)</h3>
                  <div className="flex items-center w-32 bg-neutral-950 border border-neutral-800 rounded-lg p-1">
                    <button 
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))} 
                      disabled={isOutOfStock}
                      className="w-8 h-8 flex items-center justify-center text-lg font-bold text-neutral-400 hover:bg-neutral-800 rounded transition-all disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-bold">{engToBdNum(quantity)}</span>
                    <button 
                      onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))} 
                      disabled={isOutOfStock || quantity >= currentStock}
                      className="w-8 h-8 flex items-center justify-center text-lg font-bold text-neutral-400 hover:bg-neutral-800 rounded transition-all disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 🔹 অর্ডার বাটন (স্টক না থাকলে ডিজেবল থাকবে) */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  disabled={isOutOfStock}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-black font-extrabold py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  {isOutOfStock ? "Out of Stock" : "Buy Now (অর্ডার করুন)"}
                </button>
                <button 
                  onClick={() => setCurrentStep(1)}
                  disabled={isOutOfStock}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-amber-500 border border-neutral-700 font-bold py-3.5 rounded-xl transition-all"
                >
                  {isOutOfStock ? "স্টক শেষ" : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="p-6 md:p-10 bg-neutral-900">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6 border-b border-neutral-800 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-neutral-100">ডেলিভারি তথ্য ও অর্ডার ফর্ম</h2>
              <button onClick={() => setCurrentStep(0)} className="text-sm text-amber-500 hover:underline font-semibold">
                &larr; প্রোডাক্ট পরিবর্তন করুন
              </button>
            </div>

            <div className="mb-6 p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-sm text-neutral-300 grid grid-cols-1 md:grid-cols-3 gap-2">
              <div><strong>প্রোডাক্ট নাম:</strong> <span className="text-neutral-400 line-clamp-1">{product.name}</span></div>
              <div>
                <strong>অপশন:</strong> কালার: <span className="text-amber-500 font-bold">{selectedColor}</span> | সাইজ: <span className="text-amber-500 font-bold">{selectedSize}</span> | পরিমাণ: <span className="text-amber-500 font-bold">{engToBdNum(quantity)}টি</span>
              </div>
              <div className="md:text-right font-bold text-amber-500 text-base">সর্বমোট মূল্য: {formatBDT(currentPrice * quantity)}</div>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-1">আপনার নাম *</label>
                    <input type="text" name="fullName" required value={formData.fullName} onChange={handleFormChange}
                      placeholder="আপনার নাম লিখুন" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-1">মোবাইল নাম্বার *</label>
                    <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleFormChange}
                      placeholder="১১ ডিজিটের সচল মোবাইল নাম্বার দিন" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-1">বিল্ডিং / বাসা নং / রোড / রাস্তা</label>
                    <input type="text" name="area" value={formData.area} onChange={handleFormChange}
                      placeholder="বাসা বা রাস্তার বিবরণ দিন" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-1">এলাকা / পাড়া / মহল্লা / ল্যান্ডমার্ক</label>
                    <input type="text" name="address" value={formData.address} onChange={handleFormChange}
                      placeholder="যেমন: হসপিটালের পাশে, বা নির্দিষ্ট মোড়" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-1">ডেলিভারি এরিয়া ও অঞ্চল *</label>
                    <select name="region" required value={formData.region} onChange={handleFormChange}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-all text-neutral-400">
                      <option value="">দয়া করে আপনার বিভাগ নির্বাচন করুন</option>
                      <option value="Dhaka">ঢাকা বিভাগ</option>
                      <option value="Chittagong">চট্টগ্রাম বিভাগ</option>
                      <option value="Rajshahi">রাজশাহী বিভাগ</option>
                      <option value="Khulna">খুলনা বিভাগ</option>
                      <option value="Barisal">বরিশাল বিভাগ</option>
                      <option value="Sylhet">সিলেট বিভাগ</option>
                      <option value="Rangpur">রংপুর বিভাগ</option>
                      <option value="Mymensingh">ময়মনসিংহ বিভাগ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-1">জেলা বা থানা নাম লিখুন *</label>
                    <input type="text" name="city" required value={formData.city} onChange={handleFormChange}
                      placeholder="আপনার জেলা বা থানার নাম" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-2">ঠিকানার ধরন নির্বাচন করুন:</label>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setFormData({ ...formData, label: "OFFICE" })}
                        className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-bold transition-all ${
                          formData.label === "OFFICE" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                        }`}>
                        💼 অফিস (OFFICE)
                      </button>
                      <button type="button" onClick={() => setFormData({ ...formData, label: "HOME" })}
                        className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-bold transition-all ${
                          formData.label === "HOME" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                        }`}>
                        🏠 বাসা (HOME)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* পেমেন্ট পদ্ধতি */}
              <div className="border-t border-neutral-800 pt-6">
                <label className="block text-sm font-semibold text-neutral-300 mb-3">পেমেন্ট পদ্ধতি নির্বাচন করুন *</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`py-3 px-2 rounded-lg border text-xs font-bold transition-all ${
                      paymentMethod === "cod" ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    💵 ক্যাশ অন ডেলিভারি
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bkash")}
                    className={`py-3 px-2 rounded-lg border text-xs font-bold transition-all ${
                      paymentMethod === "bkash" ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    📱 বিকাশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("nagad")}
                    className={`py-3 px-2 rounded-lg border text-xs font-bold transition-all ${
                      paymentMethod === "nagad" ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    📱 নগদ
                  </button>
                </div>

                {paymentMethod !== "cod" && (
                  <div className="mt-4 bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      এই নাম্বারে <strong className="text-white">
                        {paymentMethod === "bkash" ? BKASH_NUMBER : NAGAD_NUMBER}
                      </strong> (
                      {paymentMethod === "bkash" ? "বিকাশ" : "নগদ"} — Send Money) এ{" "}
                      <strong className="text-amber-500">{formatBDT(currentPrice * quantity)}</strong> সেন্ড মানি করে
                      নিচে ট্রানজেকশন আইডি (TrxID) দিন।
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1">ট্রানজেকশন আইডি (TrxID) *</label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="যেমন: 8N7A2XXXXX"
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>

              {submitError && (
                <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-2.5">
                  {submitError}
                </p>
              )}

              <div className="flex justify-end pt-4 border-t border-neutral-800">
                <button
                  type="submit"
                  disabled={isSubmitting || isOutOfStock}
                  className="w-full md:w-56 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-black font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition-all text-center tracking-wide"
                >
                  {isSubmitting ? "অর্ডার সেভ হচ্ছে..." : "অর্ডার নিশ্চিত করুন"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {showThankYou && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300">
          <div className="bg-neutral-900 border border-amber-500/30 w-full max-w-md p-8 rounded-2xl text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] mx-4">
            <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-amber-500 mb-3">আলহামদুলিল্লাহ্‌, অর্ডারটি সফল হয়েছে!</h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 px-1">
              মায়াবী বুটিকস-এর ওপর আস্থা রাখার জন্য আপনাকে অসংখ্য ধন্যবাদ। আপনার পছন্দের এই প্রিমিয়াম ডিজাইনটি অতি দ্রুত আপনার ঠিকানায় পৌঁছে দিতে আমাদের টিম এখনই কাজ শুরু করে দিয়েছে! ইনশাআল্লাহ্‌, খুব শীঘ্রই চমৎকার এই কালেকশনটি আপনার ফ্যাশনে নতুন মুগ্ধতা ছড়াবে। ✨
            </p>
            <button
              onClick={() => { setShowThankYou(false); setCurrentStep(0); }}
              className="w-full bg-gradient-to-r from-amber-500 to-[#a37f3d] hover:from-amber-600 hover:to-[#8c6c33] text-black font-black py-3 rounded-xl text-xs sm:text-sm tracking-wider shadow-lg transition-all active:scale-[0.97]"
            >
              ঠিক আছে, ধন্যবাদ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}