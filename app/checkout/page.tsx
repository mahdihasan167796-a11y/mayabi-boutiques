"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCart, itemKey } from "@/lib/cart-context";
import { formatBDT, engToBdNum } from "@/lib/utils";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function CheckoutPage() {
  const { items, subtotal, updateQuantity, clearCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    region: "",
    city: "",
    area: "",
    address: "",
    label: "HOME",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad" | "rocket" | "sslcommerz">("cod");
  const [transactionId, setTransactionId] = useState("");
  const [sslcommerzEnabled, setSslcommerzEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/public-settings")
      .then((res) => res.json())
      .then((data) => setSslcommerzEnabled(Boolean(data.sslcommerzEnabled)))
      .catch(() => {});
  }, []);

  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  // লগইন করা থাকলে নাম/ফোন/ইমেইল অটো-ফিল করে দেওয়া
  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (data.user) {
        setLoggedInUserId(data.user.id);
        const meta = data.user.user_metadata as any;
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || meta?.full_name || "",
          phoneNumber: prev.phoneNumber || meta?.phone || "",
          email: prev.email || data.user.email || "",
        }));
      }
    });
  }, []);

  const BKASH_NUMBER = process.env.NEXT_PUBLIC_BKASH_NUMBER || "01700-000000";
  const NAGAD_NUMBER = process.env.NEXT_PUBLIC_NAGAD_NUMBER || "01700-000000";
  const ROCKET_NUMBER = process.env.NEXT_PUBLIC_ROCKET_NUMBER || "01700-000000";

  const discount = couponApplied?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  // ফোন নাম্বার লেখা শুরু হলে (এবং কার্টে আইটেম থাকলে) কার্টের একটা স্ন্যাপশট ট্র্যাক করা হয় —
  // যাতে কেউ চেকআউট শেষ না করে চলে গেলে পরে SMS রিমাইন্ডার পাঠানো যায়। ১.৫ সেকেন্ড ডিবাউন্স
  // করা হয়েছে যাতে প্রতিটা কি-স্ট্রোকে রিকোয়েস্ট না যায়।
  useEffect(() => {
    const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 11 || items.length === 0) return;

    const timer = setTimeout(() => {
      fetch("/api/cart/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phoneNumber,
          customer_name: formData.fullName,
          items: items.map((it) => ({
            name: it.name,
            color: it.color,
            size: it.size,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
          })),
          subtotal,
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.phoneNumber, formData.fullName, items, subtotal]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setCouponError(result.error || "কুপন কোডটি সঠিক নয়।");
        setCouponApplied(null);
        return;
      }
      setCouponApplied({ code: result.code, discount: result.discount });
    } catch {
      setCouponError("কুপন যাচাই করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (items.length === 0) return;

    if ((paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") && !transactionId.trim()) {
      setSubmitError("বিকাশ/নগদ-এ সেন্ড মানি করার পর ট্রানজেকশন আইডি দিন।");
      return;
    }

    setIsSubmitting(true);
    try {
      if (paymentMethod === "sslcommerz") {
        const initRes = await fetch("/api/payment/sslcommerz/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((it) => ({
              product_id: it.productId,
              product_name: it.name,
              category_slug: it.categorySlug,
              image: it.image,
              color: it.color,
              size: it.size,
              quantity: it.quantity,
              unit_price: it.unitPrice,
            })),
            discount_amount: discount,
            coupon_code: couponApplied?.code || undefined,
            customer_name: formData.fullName,
            phone: formData.phoneNumber,
            email: formData.email || undefined,
            address: formData.address,
            region: formData.region,
            city: formData.city,
            area: formData.area,
          }),
        });
        const initResult = await initRes.json();
        if (!initRes.ok || !initResult.ok) {
          setSubmitError(initResult.error || "পেমেন্ট শুরু করা যায়নি।");
          setIsSubmitting(false);
          return;
        }
        window.location.href = initResult.gatewayUrl; // SSLCommerz-এর পেমেন্ট পেজে রিডাইরেক্ট
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            product_id: it.productId,
            product_name: it.name,
            category_slug: it.categorySlug,
            image: it.image,
            color: it.color,
            size: it.size,
            quantity: it.quantity,
            unit_price: it.unitPrice,
          })),
          coupon_code: couponApplied?.code || undefined,
          customer_name: formData.fullName,
          phone: formData.phoneNumber,
          email: formData.email || undefined,
          user_id: loggedInUserId || undefined,
          region: formData.region,
          city: formData.city,
          area: formData.area,
          address: formData.address,
          address_label: formData.label,
          payment_method: paymentMethod,
          transaction_id: paymentMethod !== "cod" ? transactionId.trim() : undefined,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.ok) {
        setSubmitError(result.error || "অর্ডার সেভ করা যায়নি, একটু পরে আবার চেষ্টা করুন।");
        return;
      }

      clearCart();
      setShowThankYou(true);
    } catch {
      setSubmitError("ইন্টারনেট সংযোগে সমস্যা হয়েছে, একটু পরে আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showThankYou) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white/[0.04] border border-amber-500/30 w-full max-w-md p-8 rounded-2xl text-center shadow-2xl">
          <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-black text-amber-400 mb-3">আলহামদুলিল্লাহ্‌, অর্ডারটি সফল হয়েছে!</h3>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
            মায়াবী বুটিকস-এর ওপর আস্থা রাখার জন্য ধন্যবাদ। আমাদের টিম এখনই আপনার অর্ডার প্রস্তুত করতে কাজ শুরু করে দিয়েছে।
          </p>
          <Link
            href="/"
            className="w-full block bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black py-3 rounded-xl text-sm"
          >
            হোমে ফিরে যান
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
        <span className="text-5xl opacity-30">🛍️</span>
        <p className="text-gray-400">আপনার কার্ট খালি — চেকআউট করার আগে কিছু প্রোডাক্ট যোগ করুন।</p>
        <Link
          href="/"
          className="text-sm text-amber-400 border border-amber-500/30 px-5 py-2.5 rounded-full hover:bg-amber-500 hover:text-black transition-all"
        >
          কালেকশন দেখুন
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-5 gap-8">
      {/* বাম পাশ — ডেলিভারি ফর্ম */}
      <form onSubmit={handleSubmit} className="md:col-span-3 space-y-6 order-2 md:order-1">
        <h1 className="font-serif text-xl font-bold text-white">ডেলিভারি তথ্য ও পেমেন্ট</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.9)]">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">আপনার নাম *</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleFormChange}
              placeholder="আপনার নাম লিখুন"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">মোবাইল নাম্বার *</label>
            <input
              type="tel"
              name="phoneNumber"
              required
              value={formData.phoneNumber}
              onChange={handleFormChange}
              placeholder="১১ ডিজিটের সচল মোবাইল নাম্বার"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">ইমেইল (ঐচ্ছিক)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleFormChange}
              placeholder="অর্ডার কনফার্মেশন ইমেইলে পেতে চাইলে দিন"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">বাসা নং / রোড</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleFormChange}
              placeholder="বাসা বা রাস্তার বিবরণ"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">এলাকা / ল্যান্ডমার্ক</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              placeholder="যেমন: হসপিটালের পাশে"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">বিভাগ *</label>
            <select
              name="region"
              required
              value={formData.region}
              onChange={handleFormChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            >
              <option value="">নির্বাচন করুন</option>
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
            <label className="block text-xs font-semibold text-gray-400 mb-1">জেলা বা থানা *</label>
            <input
              type="text"
              name="city"
              required
              value={formData.city}
              onChange={handleFormChange}
              placeholder="আপনার জেলা বা থানা"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, label: "HOME" })}
              className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                formData.label === "HOME" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-white/10 text-gray-400"
              }`}
            >
              🏠 বাসা (HOME)
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, label: "OFFICE" })}
              className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                formData.label === "OFFICE" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-white/10 text-gray-400"
              }`}
            >
              💼 অফিস (OFFICE)
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-3 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.9)]">
          <label className="block text-xs font-semibold text-gray-400">পেমেন্ট পদ্ধতি নির্বাচন করুন *</label>
          <div className={`grid grid-cols-2 ${sslcommerzEnabled ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-2`}>
            <button
              type="button"
              onClick={() => setPaymentMethod("cod")}
              className={`py-3 rounded-lg border text-[11px] sm:text-xs font-bold transition-all ${
                paymentMethod === "cod" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-white/10 text-gray-400"
              }`}
            >
              💵 ক্যাশ অন ডেলিভারি
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("bkash")}
              className={`py-3 rounded-lg border text-[11px] sm:text-xs font-bold transition-all ${
                paymentMethod === "bkash" ? "border-pink-500 bg-pink-500/10 text-pink-400" : "border-white/10 text-gray-400"
              }`}
            >
              📱 বিকাশ
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("nagad")}
              className={`py-3 rounded-lg border text-[11px] sm:text-xs font-bold transition-all ${
                paymentMethod === "nagad" ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-white/10 text-gray-400"
              }`}
            >
              📱 নগদ
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("rocket")}
              className={`py-3 rounded-lg border text-[11px] sm:text-xs font-bold transition-all ${
                paymentMethod === "rocket" ? "border-purple-500 bg-purple-500/10 text-purple-400" : "border-white/10 text-gray-400"
              }`}
            >
              📱 রকেট
            </button>
            {sslcommerzEnabled && (
              <button
                type="button"
                onClick={() => setPaymentMethod("sslcommerz")}
                className={`py-3 rounded-lg border text-[11px] sm:text-xs font-bold transition-all ${
                  paymentMethod === "sslcommerz" ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-white/10 text-gray-400"
                }`}
              >
                💳 কার্ড/অনলাইন
              </button>
            )}
          </div>

          {(paymentMethod === "bkash" || paymentMethod === "nagad" || paymentMethod === "rocket") && (
            <div className="pt-2 space-y-2">
              <p className="text-xs text-gray-300 leading-relaxed">
                এই নাম্বারে{" "}
                <strong className="text-white">{paymentMethod === "bkash" ? BKASH_NUMBER : paymentMethod === "nagad" ? NAGAD_NUMBER : ROCKET_NUMBER}</strong> এ{" "}
                <strong className="text-amber-400">{formatBDT(total)}</strong> সেন্ড মানি করে ট্রানজেকশন আইডি দিন।
              </p>
              <input
                type="text"
                required
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="ট্রানজেকশন আইডি (TrxID)"
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
            </div>
          )}
        </div>

        {submitError && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-4 py-2.5">{submitError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 disabled:opacity-60 text-black font-black py-4 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55),0_0_46px_-6px_rgba(245,158,11,0.65)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7),0_0_64px_-4px_rgba(245,158,11,0.9)] transition-all duration-500 ease-out"
        >
          {isSubmitting
            ? paymentMethod === "sslcommerz"
              ? "পেমেন্ট পেজে নিয়ে যাওয়া হচ্ছে..."
              : "অর্ডার সেভ হচ্ছে..."
            : paymentMethod === "sslcommerz"
            ? `পেমেন্ট পেজে যান — ${formatBDT(total)}`
            : `অর্ডার নিশ্চিত করুন — ${formatBDT(total)}`}
        </button>
      </form>

      {/* ডান পাশ — অর্ডার সামারি */}
      <div className="md:col-span-2 space-y-4 order-1 md:order-2">
        <div className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-4 md:sticky md:top-28 shadow-[0_20px_45px_-25px_rgba(0,0,0,0.9)]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            অর্ডার সামারি ({engToBdNum(items.length)}টি প্রোডাক্ট)
          </h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => {
              const key = itemKey(item);
              return (
                <div key={key} className="flex gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-14 rounded-lg object-cover border border-white/10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white line-clamp-1">{item.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {[item.color, item.size].filter(Boolean).join(" · ")}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-amber-400 border border-white/10 rounded"
                      >
                        −
                      </button>
                      <span className="text-[11px] text-gray-300 w-4 text-center">{engToBdNum(item.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-amber-400 border border-white/10 rounded disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-amber-400 shrink-0">{formatBDT(item.unitPrice * item.quantity)}</p>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="কুপন কোড থাকলে দিন"
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="px-4 text-xs font-bold text-amber-400 border border-amber-500/40 rounded-lg hover:bg-amber-500 hover:text-black transition-all disabled:opacity-50"
              >
                {couponLoading ? "..." : "প্রয়োগ করুন"}
              </button>
            </div>
            {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}
            {couponApplied && (
              <p className="text-[11px] text-green-400">✓ কুপন &ldquo;{couponApplied.code}&rdquo; প্রয়োগ হয়েছে</p>
            )}
          </div>

          <div className="border-t border-white/10 pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>সাবটোটাল</span>
              <span>{formatBDT(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>ছাড়</span>
                <span>-{formatBDT(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-black text-base pt-1 border-t border-white/10 mt-1">
              <span>সর্বমোট</span>
              <span>{formatBDT(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
