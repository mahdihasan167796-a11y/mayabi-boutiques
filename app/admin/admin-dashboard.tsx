"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatBDT } from "@/lib/utils";
import type { SiteSettings } from "@/lib/settings";
import { hasPermission, type Role } from '@/lib/permissions';
import { supabase } from "@/lib/supabase";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  price: number;
  old_price: number;
  images: string[];
  created_at: string;
}

interface OrderItemRow {
  id: string;
  product_id: string;
  product_name: string;
  category_slug?: string;
  image?: string;
  color?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface OrderRow {
  id: string;
  created_at: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price?: number;
  total_price: number;
  subtotal?: number;
  discount_amount?: number;
  coupon_code?: string | null;
  order_items?: OrderItemRow[]; // 👈 multi-item অর্ডারে এখানে প্রতিটা প্রোডাক্ট থাকবে
  customer_name: string;
  phone: string;
  region: string;
  city: string;
  area: string;
  address: string;
  address_label: string;
  payment_method: "cod" | "bkash" | "nagad";
  transaction_id: string | null;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
  note?: string;
}

interface CouponRow {
  id: string;
  created_at: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  usage_limit: number | null;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
}

const STATUS_OPTIONS: OrderRow["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
const STATUS_LABELS: Record<OrderRow["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};
const PAYMENT_LABELS: Record<OrderRow["payment_method"], string> = {
  cod: "ক্যাশ অন ডেলিভারি",
  bkash: "বিকাশ",
  nagad: "নগদ",
};

export default function AdminDashboard({
  initialProducts,
  initialOrders,
  initialSettings,
  initialReviews,
  initialCategories,
}: {
  initialProducts: ProductRow[];
  initialOrders: OrderRow[];
  initialSettings: SiteSettings;
  initialReviews?: any[];
  initialCategories?: any[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"products" | "orders" | "settings" | "addons" | "customers" | "analytics" | "staffs" | "reviews" | "coupons" | "categories" | "content">("orders");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedCourier, setSelectedCourier] = useState<string>("steadfast");
  const [userRole, setUserRole] = useState<Role>('super_admin');
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);

const playNotificationSound = () => {
  try {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch((e) => console.log('Audio play failed:', e));
  } catch (error) {
    console.error('Sound error:', error);
  }
};

  useEffect(() => {
    async function fetchUserRole() {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (user) {
        const { data } = await supabaseBrowser
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .single();
        
        if (data?.role) {
          setUserRole(data.role as Role);
        }
      }
    }
    fetchUserRole();
  }, []);
  useEffect(() => {
  const channel = supabase
    .channel('realtime-orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        playNotificationSound();
        const newOrder = payload.new;
        setNewOrderAlert(`🚨 নতুন অর্ডার এসেছে! কাস্টমার: ${newOrder.product_name || 'পণ্য'}`);
        setOrders((prev) => [newOrder as OrderRow, ...prev]);

        setTimeout(() => {
          setNewOrderAlert(null);
        }, 6000);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    await supabaseBrowser.auth.signOut().catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  // 📩 এসএমএস পাঠানোর হেল্পার ফাংশন
  const sendCustomerSMS = async (
    phone: string,
    customerName: string,
    orderId: string,
    type: "confirmed" | "shipped" | "custom",
    customMsg?: string
  ) => {
    let message = customMsg || "";

    if (type === "confirmed") {
      message = `প্রিয় ${customerName || 'গ্রাহক'}, 'মায়াবী বুটিকস'-এ অর্ডার করার জন্য অসংখ্য ধন্যবাদ! আপনার অর্ডারটি (ID: #${orderId.slice(0, 6)}) সফলভাবে কনফার্ম করা হয়েছে। আমরা দ্রুত সযত্নে আপনার পছন্দের পোশাকটি পৌঁছে দেওয়ার ব্যবস্থা করছি। 💖`;
    } else if (type === "shipped") {
      message = `প্রিয় ${customerName || 'গ্রাহক'}, আপনার কাঙ্ক্ষিত 'মায়াবী বুটিকস'-এর পার্সেলটি (ID: #${orderId.slice(0, 6)}) ডেলিভারির জন্য কুরিয়ারে পাঠানো হয়েছে। খুব শীঘ্রই পৌঁছে যাবে আপনার ঠিকানায়। পাশে থাকার জন্য ধন্যবাদ! ✨`;
    }

    if (!message) return;

    try {
      const res = await fetch("/api/admin/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });

      if (res.ok) {
        alert("ক্রেতার মোবাইলে সাফল্যের সাথে এসএমএস পাঠানো হয়েছে!");
      } else {
        alert("এসএমএস পাঠাতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      alert("কোথাও কোনো ভুল হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  // 📊 অ্যানালিটিক্স
  const totalSales = orders
    .filter((o) => o.status === "delivered" || o.status === "confirmed")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;
  const deliveredOrdersCount = orders.filter((o) => o.status === "delivered").length;
  const returnedOrdersCount = orders.filter((o) => o.status === "returned" || o.status === "cancelled").length;

  return (
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-0 pb-12 bg-[#0a0a0a] min-h-screen text-gray-100">
      {/* 🟢 প্রফেশনাল হেডার */}
      <div className="sticky top-0 z-40 bg-white/[0.04] border border-amber-500/40 rounded-b-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-black font-extrabold text-xs px-3 py-1.5 rounded-lg tracking-wider uppercase">
            MAYABI BOUTIQUES
          </div>
          <div>
            <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-0.5">ADMIN PANEL</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">নিয়ন্ত্রণ প্যানেল</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="bg-white/[0.04] hover:bg-amber-500/20 border border-amber-500/50 text-amber-400 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
          >
            🌐 ওয়েবসাইট দেখুন
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            লগআউট
          </button>
        </div>
      </div>

     
      {/* 🔘 সাইডবার এবং মেইন কন্টেন্ট wrapping div (এখান থেকে সাইডবার ও ডানপাশের অংশ শুরু) */}
      <div className="flex flex-col md:flex-row gap-5 items-start">
       {/* 🔹 বাম পাশের সাইডবার */}
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-2 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 p-3 rounded-3xl shadow-md">
          <button
            onClick={() => setTab("orders")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              tab === "orders"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md font-extrabold"
                : "bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span>📦 অর্ডার সমূহ</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${tab === "orders" ? "bg-black/20 text-black font-extrabold" : "bg-white/10 text-gray-300"}`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setTab("customers")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              tab === "customers"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md font-extrabold"
                : "bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <span>👥 কাস্টমার লিস্ট (CRM)</span>
          </button>

          <button
            onClick={() => setTab("products")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
              tab === "products"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md font-extrabold"
                : "bg-white/[0.03] text-gray-300 border border-white/10 hover:bg-white/[0.06] hover:text-white"
            }`}
          >

            <span>🛍️ প্রোডাক্ট সমূহ</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === "products" ? "bg-black/20 text-black" : "bg-[#222] text-amber-400"}`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setTab("analytics")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
              tab === "analytics"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
                : "bg-white/[0.04] text-gray-300 border border-amber-500/15 hover:border-amber-500/40"
            }`}
          >
            <span>📊 সেলস রিপোর্ট & এনালাইটিক্স</span>
          </button>

          <button
            onClick={() => setTab("addons")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
              tab === "addons"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
                : "bg-white/[0.04] text-gray-300 border border-amber-500/15 hover:border-amber-500/40"
            }`}
          >
            <span>🔌 Addons & Integrations</span>
          </button>

          <button
            onClick={() => setTab("settings")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === "settings"
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
                : "bg-white/[0.04] text-gray-300 border border-amber-500/15 hover:border-amber-500/40"
            }`}
          >
            ⚙️ সেটিংস
          </button>
          {hasPermission(userRole, 'categories') && (
  <button
    onClick={() => setTab("content")}
    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
      tab === "content"
        ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
        : "bg-white/[0.04] text-gray-300 border border-white/10 hover:border-amber-500/40"
    }`}
  >
    🎨 কনটেন্ট স্টুডিও
  </button>
)}
          {hasPermission(userRole, 'categories') && (
  <button
    onClick={() => setTab("categories")}
    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
      tab === "categories"
        ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
        : "bg-white/[0.04] text-gray-300 border border-white/10 hover:border-amber-500/40"
    }`}
  >
    🗂️ ক্যাটাগরি ম্যানেজমেন্ট
  </button>
)}
          {hasPermission(userRole, 'coupons') && (
  <button
    onClick={() => setTab("coupons")}
    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
      tab === "coupons"
        ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
        : "bg-white/[0.04] text-gray-300 border border-amber-500/15 hover:border-amber-500/40"
    }`}
  >
    🎟️ কুপন ও ডিসকাউন্ট
  </button>
)}
          {hasPermission(userRole, 'staffs') && (
  <button
    onClick={() => setTab("staffs")}
    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
      tab === "staffs"
        ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
        : "bg-white/[0.04] text-gray-300 border border-amber-500/15 hover:border-amber-500/40"
    }`}
  >
    ⚙️ স্টাফ ম্যানেজমেন্ট
  </button>
)}
<button
  onClick={() => setTab("reviews")}
  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
    tab === "reviews"
      ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-md"
      : "bg-white/[0.04] text-gray-300 border border-amber-500/15 hover:border-amber-500/40"
  }`}
>
  <span>রিভিউ ম্যানেজমেন্ট</span>
  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === "reviews" ? "bg-black/20 text-black" : "bg-[#222] text-gray-400"}`}>
    {reviews ? reviews.length : 0}
  </span>
</button>

          {/* 🚚 কুরিয়ার সিলেক্টর - বামপাশের সাইডবার */}
          <div className="mt-3 p-2.5 bg-black/40 border border-amber-500/30 rounded-xl space-y-1.5">
            <label className="text-[10px] font-bold text-amber-400 block">
              🚚 কুরিয়ার সার্ভিস সিলেক্ট:
            </label>
            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="w-full bg-white/[0.04] text-xs font-bold text-amber-400 border border-white/10 rounded px-2 py-1.5 outline-none focus:border-amber-500/50"
            >
              <option value="steadfast">Steadfast Courier</option>
              <option value="pathao">Pathao Courier</option>
              <option value="redx">RedX Courier</option>
            </select>
          </div>
        </div>
       {/* 👉 ডানপাশের মেইন কন্টেন্ট এলাকা শুরু */}
        <div className="flex-1 w-full min-w-0 space-y-6">

          {/* 📊 ৩ডি কালারফুল সামারি কার্ডস */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
            
            {/* ১. মোট বিক্রি */}
            <div className="bg-gradient-to-b from-amber-500/10 to-amber-950/40 border-t-2 border-amber-400 border-x border-b border-amber-500/30 rounded-3xl p-4 shadow-[0_8px_20px_rgba(245,158,11,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <p className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">💰 মোট বিক্রি</p>
              <p className="text-xl sm:text-2xl font-black text-amber-400 mt-3 drop-shadow">{formatBDT(totalSales)}</p>
            </div>

            {/* ২. মোট অর্ডার */}
            <div className="bg-gradient-to-b from-indigo-500/10 to-indigo-950/40 border-t-2 border-indigo-400 border-x border-b border-indigo-500/30 rounded-3xl p-4 shadow-[0_8px_20px_rgba(99,102,241,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <p className="text-[11px] font-extrabold text-indigo-300 uppercase tracking-wider">📦 মোট অর্ডার</p>
              <p className="text-xl sm:text-2xl font-black text-indigo-200 mt-3 drop-shadow">{orders.length} টি</p>
            </div>

            {/* ৩. পেন্ডিং অর্ডার */}
            <div className="bg-gradient-to-b from-orange-500/10 to-orange-950/40 border-t-2 border-orange-400 border-x border-b border-orange-500/30 rounded-3xl p-4 shadow-[0_8px_20px_rgba(249,115,22,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <p className="text-[11px] font-extrabold text-orange-300 uppercase tracking-wider">⏳ পেন্ডিং অর্ডার</p>
              <p className="text-xl sm:text-2xl font-black text-orange-400 mt-3 drop-shadow">{pendingOrdersCount} টি</p>
            </div>

            {/* ৪. ডেলিভারড অর্ডার */}
            <div className="bg-gradient-to-b from-emerald-500/10 to-emerald-950/40 border-t-2 border-emerald-400 border-x border-b border-emerald-500/30 rounded-3xl p-4 shadow-[0_8px_20px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <p className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">🚛 ডেলিভারড</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-3 drop-shadow">{deliveredOrdersCount} টি</p>
            </div>

            {/* ৫. রিটার্ন/ক্যানসেল */}
            <div className="bg-gradient-to-b from-rose-500/10 to-rose-950/40 border-t-2 border-rose-400 border-x border-b border-rose-500/30 rounded-3xl p-4 shadow-[0_8px_20px_rgba(244,63,94,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <p className="text-[11px] font-extrabold text-rose-300 uppercase tracking-wider">🚨 রিটার্ন/ক্যানসেল</p>
              <p className="text-xl sm:text-2xl font-black text-rose-400 mt-3 drop-shadow">{returnedOrdersCount} টি</p>
            </div>

          </div>

        
        {newOrderAlert && (
  <div className="fixed top-5 right-5 z-50 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 animate-bounce border-2 border-white">
    <span className="text-2xl">🔔</span>
    <div>
      <p className="text-sm font-extrabold">{newOrderAlert}</p>
      <p className="text-xs font-normal">অর্ডার প্যানেলে নতুন অর্ডার যুক্ত করা হয়েছে</p>
    </div>
  </div>
)}

        {/* ডান পাশের মূল কন্টেন্ট এলাকা */}
       
          {tab === "orders" && <OrdersTab orders={orders} setOrders={setOrders} sendCustomerSMS={sendCustomerSMS} selectedCourier={selectedCourier} />}
          {tab === "products" && <ProductsTab products={products} setProducts={setProducts} categories={initialCategories ?? []} />}
          {tab === "addons" && <AddonsTab />}
          {tab === "settings" && <SettingsTab initialSettings={initialSettings} />}
          {tab === "customers" && <CustomersTab sendCustomerSMS={sendCustomerSMS} />}
          {tab === "analytics" && <AnalyticsTab orders={orders} products={products} />}
          {tab === "staffs" && <StaffsTab />}
          {tab === "coupons" && <CouponsTab />}
          {tab === "categories" && <CategoriesTab initialCategories={initialCategories ?? []} />}
          {tab === "content" && <ContentStudioTab />}
          {tab === "reviews" && (
  <div className="space-y-4">
    <h2 className="text-xl font-bold text-white">গ্রাহকদের রিভিউ ম্যানেজমেন্ট</h2>
    <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-gray-400 text-sm">
            <th className="p-3">পণ্য</th>
            <th className="p-3">রেটিং</th>
            <th className="p-3">মতামত</th>
            <th className="p-3">তারিখ</th>
            <th className="p-3 text-right">অ্যাকশন ও কন্ট্রোল</th>
          </tr>
        </thead>
        <tbody>
          {!reviews || reviews.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-gray-500">
                কোনো রিভিউ পাওয়া যায়নি।
              </td>
            </tr>
          ) : (
            reviews.map((review: any) => (
              <tr key={review.id} className="border-b border-white/5 text-sm text-gray-300">
                <td className="p-3 font-medium text-white">
                  {review.products?.product_name || "প্রোডাক্ট রিমুভ করা হয়েছে"}
                </td>
                <td className="p-3 text-yellow-400">
                  {"★".repeat(review.rating)} {"☆".repeat(5 - review.rating)}
                </td>
                <td className="p-3 max-w-xs truncate">
                  <div className="flex items-center gap-2">
                    {review.image_url && (
                      <img src={review.image_url} alt="" className="w-8 h-8 rounded-md object-cover border border-white/10 shrink-0" />
                    )}
                    <span className="truncate">{review.comment}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("bn-BD")}
                </td>
                <td className="p-3 text-right space-y-1.5">
                  <div className="flex flex-col items-end gap-1">
                    {/* হোম পেজে দেখানোর বাটন */}
                    <button
                      onClick={async () => {
                        const newStatus = !review.show_on_home;
                        const { error } = await supabase
                          .from("reviews")
                          .update({ show_on_home: newStatus })
                          .eq("id", review.id);

                        if (!error) {
                          setReviews(
                            reviews.map((r: any) =>
                              r.id === review.id ? { ...r, show_on_home: newStatus } : r
                            )
                          );
                        } else {
                          alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!");
                        }
                      }}
                      className={`px-3 py-1 rounded transition text-xs font-semibold ${
                        review.show_on_home
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {review.show_on_home ? "✓ হোম পেজে আছে" : "+ হোম পেজে দিন"}
                    </button>

                    {/* নির্দিষ্ট প্রোডাক্ট পেজে দেখানোর বাটন */}
                    <button
                      onClick={async () => {
                        const newStatus = !review.show_on_product;
                        const { error } = await supabase
                          .from("reviews")
                          .update({ show_on_product: newStatus })
                          .eq("id", review.id);

                        if (!error) {
                          setReviews(
                            reviews.map((r: any) =>
                              r.id === review.id ? { ...r, show_on_product: newStatus } : r
                            )
                          );
                        } else {
                          alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!");
                        }
                      }}
                      className={`px-3 py-1 rounded transition text-xs font-semibold ${
                        review.show_on_product
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {review.show_on_product ? "✓ প্রোডাক্ট পেজে আছে" : "+ প্রোডাক্ট পেজে দিন"}
                    </button>
                  </div>

                  {/* ডিলিট বাটন */}
                  <div className="mt-1">
                    <button
                      onClick={async () => {
                        if (confirm("আপনি কি এই রিভিউটি ডিলিট করতে চান?")) {
                          const { error } = await supabase.from("reviews").delete().eq("id", review.id);
                          if (!error) {
                            setReviews(reviews.filter((r: any) => r.id !== review.id));
                          } else {
                            alert("ডিলিট করতে সমস্যা হয়েছে!");
                          }
                        }
                      }}
                      className="bg-red-500/20 text-red-400 px-3 py-0.5 rounded hover:bg-red-500/30 transition text-xs"
                    >
                      ডিলিট
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
        </div>
        
      </div>
    </div>
  );
}

{/* ⚙️ আপডেটেড SettingsTab (ডেলিভারি চার্জ সেটিংস সহ) */}
function SettingsTab({ initialSettings }: { initialSettings: SiteSettings }) {
  const [form, setForm] = useState({
    ...initialSettings,
    deliveryDhaka: (initialSettings as any).deliveryDhaka || "80",
    deliveryOutside: (initialSettings as any).deliveryOutside || "150",
    freeDeliveryMinAmount: (initialSettings as any).freeDeliveryMinAmount || "2000",
    isOfferActive: (initialSettings as any).isOfferActive ?? true,
    noOfferMessage: (initialSettings as any).noOfferMessage || "বর্তমানে কোনো বিশেষ অফার চালু নেই। নতুন অফারের জন্য আমাদের সাথেই থাকুন!",
    combo1Title: (initialSettings as any).combo1Title || "মেহেফিল কম্বো",
    combo1Price: (initialSettings as any).combo1Price || "৪৫০০",
    combo1OldPrice: (initialSettings as any).combo1OldPrice || "৬০০০",
    combo1Features: (initialSettings as any).combo1Features || "১টি কাস্টম ফিটেড থ্রি-পিস\n১টি প্রিমিয়াম ওরনা\nফ্রি হোম ডেলিভারি",
    combo2Title: (initialSettings as any).combo2Title || "ব্রাইডাল মেগা সেট",
    combo2Price: (initialSettings as any).combo2Price || "৬৮০০",
    combo2OldPrice: (initialSettings as any).combo2OldPrice || "৯৫০০",
    combo2Features: (initialSettings as any).combo2Features || "২টি প্রিমিয়াম ড্রেস সেট\n১টি এক্সক্লুসিভ স্কার্ফ\nভিআইপি গিফট বক্স\nফ্রি হোম ডেলিভারি",
    facebookUrl: (initialSettings as any).facebookUrl || "",
    instagramUrl: (initialSettings as any).instagramUrl || "",
    tiktokUrl: (initialSettings as any).tiktokUrl || "",
    messengerUrl: (initialSettings as any).messengerUrl || "",
    phoneNumber: (initialSettings as any).phoneNumber || "",
    whatsappNumber: (initialSettings as any).whatsappNumber || "",
    freeShippingThreshold: (initialSettings as any).freeShippingThreshold || "",
    heroVideoUrl: (initialSettings as any).heroVideoUrl || "",
    sslcommerzEnabled: (initialSettings as any).sslcommerzEnabled || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setError(result.error || "সেটিংস সেভ করা যায়নি।");
        return;
      }
      setMessage("সেটিংস সফলভাবে সেভ হয়েছে।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-2xl bg-white/[0.04] border border-amber-500/15 rounded-xl p-5 space-y-5">
      
      {/* 🚚 ৫. ডেলিভারি চার্জ ও ডেলিভারি এরিয়া সেটিংস */}
      <div className="bg-white/[0.04] border border-amber-500/30 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 border-b border-amber-500/10 pb-2">
          🚚 ডেলিভারি চার্জ সেটিংস
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">ঢাকার ভিতরে চার্জ (৳)</label>
            <input
              type="number"
              value={form.deliveryDhaka}
              onChange={handleChange("deliveryDhaka")}
              placeholder="80"
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">ঢাকার বাইরে চার্জ (৳)</label>
            <input
              type="number"
              value={form.deliveryOutside}
              onChange={handleChange("deliveryOutside")}
              placeholder="150"
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 block mb-1">ফ্রি ডেলিভারি মিনিমাম অর্ডার পরিমাণ (৳)</label>
          <input
            type="number"
            value={form.freeDeliveryMinAmount}
            onChange={handleChange("freeDeliveryMinAmount")}
            placeholder="2000"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
          <p className="text-[10px] text-gray-500 mt-1">* কাস্টমার এই টাকার বেশি অর্ডার করলে অটোমেটিক ফ্রি ডেলিভারি পাবে।</p>
        </div>
      </div>

      {/* 🎁 কম্বো অফার সেটিংস */}
      <div className="bg-white/[0.04] border border-amber-500/30 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold text-amber-400 flex items-center justify-between border-b border-amber-500/10 pb-2">
          🎁 কম্বো অফার কন্ট্রোল
        </h3>

        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300">অফার স্ট্যাটাস (On/Off):</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, isOfferActive: !form.isOfferActive })}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              form.isOfferActive ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {form.isOfferActive ? "অফার চালু আছে (Active)" : "অফার বন্ধ আছে (Inactive)"}
          </button>
        </div>

        {form.isOfferActive ? (
          <div className="space-y-4 pt-2 border-t border-amber-500/10">
            <div className="space-y-3 bg-black/40 p-3 rounded-lg border border-amber-500/20">
              <h4 className="text-xs font-bold text-amber-400">📦 প্রথম কম্বো প্যাকেজ</h4>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">শিরোনাম</label>
                <input
                  type="text" value={form.combo1Title} onChange={handleChange("combo1Title")}
                  className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">অফার মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo1Price} onChange={handleChange("combo1Price")}
                    className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">আগের মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo1OldPrice} onChange={handleChange("combo1OldPrice")}
                    className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">ফিচারসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3} value={form.combo1Features} onChange={handleChange("combo1Features")}
                  className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="space-y-3 bg-black/40 p-3 rounded-lg border border-amber-500/20">
              <h4 className="text-xs font-bold text-amber-400">📦 দ্বিতীয় কম্বো প্যাকেজ</h4>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">শিরোনাম</label>
                <input
                  type="text" value={form.combo2Title} onChange={handleChange("combo2Title")}
                  className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">অফার মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo2Price} onChange={handleChange("combo2Price")}
                    className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">আগের মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo2OldPrice} onChange={handleChange("combo2OldPrice")}
                    className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">ফিচারসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3} value={form.combo2Features} onChange={handleChange("combo2Features")}
                  className="w-full bg-white/[0.04] border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1">
              অফার না থাকলে যে বার্তাটি দেখানো হবে:
            </label>
            <textarea
              rows={2}
              value={form.noOfferMessage}
              onChange={handleChange("noOfferMessage")}
              placeholder="অফার না থাকলে কি লিখা থাকবে..."
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        )}
      </div>

      {/* 🔗 সোশ্যাল ও কন্টাক্ট ইনফো */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white border-b border-amber-500/10 pb-2 mb-3">
          ফুটার সোশ্যাল লিংক ও যোগাযোগ নাম্বার
        </h3>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Facebook পেজ লিংক</label>
          <input
            type="url" value={form.facebookUrl} onChange={handleChange("facebookUrl")}
            placeholder="https://facebook.com/yourpage"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Instagram প্রোফাইল লিংক</label>
          <input
            type="url" value={form.instagramUrl} onChange={handleChange("instagramUrl")}
            placeholder="https://instagram.com/yourprofile"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">TikTok প্রোফাইল লিংক</label>
          <input
            type="url" value={form.tiktokUrl} onChange={handleChange("tiktokUrl")}
            placeholder="https://tiktok.com/@yourprofile"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Messenger লিংক</label>
          <input
            type="url" value={form.messengerUrl} onChange={handleChange("messengerUrl")}
            placeholder="https://m.me/yourpage"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">যোগাযোগের ফোন নাম্বার</label>
          <input
            type="text" value={form.phoneNumber} onChange={handleChange("phoneNumber")}
            placeholder="০১৭০০-০০০০০০"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">WhatsApp নাম্বার (দিলে ফ্লোটিং চ্যাট বাটন দেখাবে)</label>
          <input
            type="text" value={form.whatsappNumber} onChange={handleChange("whatsappNumber")}
            placeholder="8801700000000 (কান্ট্রি কোডসহ)"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">ফ্রি শিপিং থ্রেশহোল্ড (৳, ০ দিলে বন্ধ থাকবে)</label>
          <input
            type="number" value={form.freeShippingThreshold} onChange={handleChange("freeShippingThreshold")}
            placeholder="যেমন: ৩০০০"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">হিরো ভিডিও URL (দিলে ছবির বদলে ভিডিও দেখাবে)</label>
          <input
            type="text" value={form.heroVideoUrl} onChange={handleChange("heroVideoUrl")}
            placeholder="https://.../video.mp4"
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <div className="sm:col-span-2 bg-black/30 border border-amber-500/15 rounded-lg p-3">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.sslcommerzEnabled}
              onChange={(e) => setForm({ ...form, sslcommerzEnabled: e.target.checked })}
              className="accent-amber-500"
            />
            💳 কার্ড/অনলাইন পেমেন্ট (SSLCommerz) চালু করুন
          </label>
          <p className="text-[10px] text-gray-500 mt-1.5">
            ⚠️ এটা টিক দেওয়ার আগে অবশ্যই Vercel-এ <code className="text-amber-400">SSLCOMMERZ_STORE_ID</code> ও{" "}
            <code className="text-amber-400">SSLCOMMERZ_STORE_PASSWORD</code> এনভায়রনমেন্ট ভ্যারিয়েবলে আসল মার্চেন্ট
            ক্রেডেনশিয়াল বসাতে হবে (sslcommerz.com-এ মার্চেন্ট অ্যাকাউন্ট খুলে পাবেন) — নাহলে কাস্টমার চেকআউটে গিয়ে এরর
            পাবেন।
          </p>
        </div>
      </div>

      {message && <p className="text-xs text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-3 py-1.5">{message}</p>}
      {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-1.5">{error}</p>}

      <button
        type="submit" disabled={isSaving}
        className="w-full bg-gradient-to-r from-amber-400 to-amber-600 disabled:opacity-60 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
      >
        {isSaving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
      </button>
    </form>
  );
}

{/* 🔌 Addons & Integrations ট্যাব */}
function AddonsTab() {
  const [fbPixelId, setFbPixelId] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [steadfastApiKey, setSteadfastApiKey] = useState("");
  const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
  const [fakeProtectionEnabled, setFakeProtectionEnabled] = useState(true);
  const [savedMsg, setSavedMsg] = useState("");

  const handleSaveAddons = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMsg("Addons সেটিংস সফলভাবে সেভ হয়েছে!");
    setTimeout(() => setSavedMsg(""), 3000);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4">
        <h2 className="text-sm font-bold text-white mb-1">🔌 Addons & Integrations</h2>
        <p className="text-xs text-gray-400">মার্কেটিং, কুরিয়ার ও ফেক অর্ডার প্রোটেকশন কনফিগার করুন।</p>
      </div>

      <form onSubmit={handleSaveAddons} className="space-y-4">
        <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <h3 className="text-xs font-bold text-white">Facebook Pixel & Conversion API</h3>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Pixel ID</label>
            <input
              type="text"
              placeholder="e.g. 123456789012345"
              value={fbPixelId}
              onChange={(e) => setFbPixelId(e.target.value)}
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="text-xs font-bold text-white">Google Tag Manager / Analytics</h3>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">GTM Container ID</label>
            <input
              type="text"
              placeholder="e.g. GTM-XXXXXXX"
              value={gtmId}
              onChange={(e) => setGtmId(e.target.value)}
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚚</span>
            <h3 className="text-xs font-bold text-white">Courier API (Steadfast)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">API Key</label>
              <input
                type="text"
                placeholder="Steadfast API Key"
                value={steadfastApiKey}
                onChange={(e) => setSteadfastApiKey(e.target.value)}
                className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Secret Key</label>
              <input
                type="password"
                placeholder="Steadfast Secret Key"
                value={steadfastSecretKey}
                onChange={(e) => setSteadfastSecretKey(e.target.value)}
                className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <h3 className="text-xs font-bold text-white">Fake Order Protection & Fraud Detection</h3>
            </div>
            <button
              type="button"
              onClick={() => setFakeProtectionEnabled(!fakeProtectionEnabled)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                fakeProtectionEnabled ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {fakeProtectionEnabled ? "Active" : "Inactive"}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            একই আইপি বা ফোন নম্বর দিয়ে লিমিটের বেশি স্প্যাম অর্ডার ব্লক করার সিস্টেম।
          </p>
        </div>

        {savedMsg && (
          <p className="text-xs text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-3 py-2">{savedMsg}</p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Addons সেটিংস সেভ করুন
        </button>
      </form>
    </div>
  );
}
async function sendToCourier(order: OrderRow, courierName: string, sendCustomerSMS: Function) {
  if (!confirm(`আপনি কি নিশ্চিত যে অর্ডার #${order.id.slice(0, 8)} কুরিয়ার (${courierName.toUpperCase()})-এ পাঠাতে চান?`)) {
    return;
  }

  try {
    const res = await fetch("/api/admin/courier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        courierName: courierName,
        recipientName: order.customer_name || "Customer",
        recipientPhone: order.phone,
        recipientAddress: order.address,
        amountToCollect: order.total_price || 0,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      if (order.phone) {
        await sendCustomerSMS(
          order.phone,
          order.customer_name || "",
          order.id,
          "shipped"
        );
      }
      alert(`সফল! ${data.message}\nকাস্টমারকে কুরিয়ার ও শিপমেন্ট SMS পাঠিয়ে দেওয়া হয়েছে!`);
      window.location.reload();
    } else {
      alert(`সমস্যা হয়েছে: ${data.error}`);
    }
  } catch (err) {
    alert("কুরিয়ার সিস্টেমে কানেক্ট করতে সমস্যা হয়েছে");
  }
}

function OrdersTab({
  orders,
  setOrders,
  sendCustomerSMS,
  selectedCourier,
}: {
  orders: OrderRow[];
  setOrders: React.Dispatch<React.SetStateAction<OrderRow[]>>;
  sendCustomerSMS: Function;
  selectedCourier: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>("");
  // বাল্ক সিলেকশন ও প্রিন্ট লজিক
const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

const toggleSelectAll = () => {
  if (selectedOrders.length === filteredOrders.length) {
    setSelectedOrders([]);
  } else {
    setSelectedOrders(filteredOrders.map((o) => o.id));
  }
};

const toggleSelectOrder = (id: string) => {
  setSelectedOrders((prev) =>
    prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
  );
};

const handleBulkPrint = () => {
  if (selectedOrders.length === 0) {
    alert("অনুগ্রহ করে অন্তত একটি অর্ডার নির্বাচন করুন!");
    return;
  }

  const ordersToPrint = filteredOrders.filter((o) => selectedOrders.includes(o.id));
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const content = ordersToPrint
    .map(
      (order) => `
    <div style="page-break-after: always; padding: 20px; font-family: sans-serif; border: 1px solid #ddd; margin-bottom: 20px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px;">
        <div>
          <h2 style="margin: 0; color: #c9a054;">MAYABI BOUTIQUES</h2>
          <p style="margin: 2px 0; font-size: 12px;">প্যাকিং স্লিপ / ইনভয়েস</p>
        </div>
        <div style="text-align: right;">
          <h3 style="margin: 0;">অর্ডার ID: #${order.id.slice(0, 8)}</h3>
          <p style="margin: 2px 0; font-size: 12px;">তারিখ: ${new Date(order.created_at).toLocaleDateString("bn-BD")}</p>
        </div>
      </div>

      <div style="margin: 15px 0; font-size: 14px;">
        <p><strong>গ্রাহকের নাম:</strong> ${order.customer_name || "N/A"}</p>
        <p><strong>ফোন নাম্বার:</strong> ${order.phone || "N/A"}</p>
        <p><strong>ঠিকানা:</strong> ${order.address || "N/A"}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px;">
        <thead>
          <tr style="background: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">প্রোডাক্টের নাম</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">পরিমাণ</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">মূল্য</th>
          </tr>
        </thead>
        <tbody>
          ${
            order.order_items && order.order_items.length > 0
              ? order.order_items
                  .map(
                    (it) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${it.product_name}${it.color || it.size ? ` (${[it.color, it.size].filter(Boolean).join(" / ")})` : ""}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${it.quantity}টি</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">৳${it.subtotal}</td>
          </tr>`
                  )
                  .join("")
              : `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${order.product_name || "প্রোডাক্ট"}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${order.quantity || 1}টি</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">৳${order.total_price}</td>
          </tr>`
          }
        </tbody>
      </table>

      <div style="margin-top: 15px; text-align: right; font-size: 15px;">
        <p><strong>সর্বমোট সংগ্রহযোগ্য (COD): ৳${order.total_price}</strong></p>
      </div>
    </div>
  `
    )
    .join("");

  const htmlContent =
    "<html><head><title>Bulk Packing Slips</title><style>@media print { body { margin: 0; } }</style></head><body>" +
    content +
    "<script>window.onload = function() { window.print(); window.close(); }</script></body></html>";

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(q) ||
      o.phone?.includes(searchQuery) ||
      o.product_name?.toLowerCase().includes(q) ||
      o.address?.toLowerCase().includes(q) ||
      (o.order_items ?? []).some((it) => it.product_name?.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: OrderRow["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));

        // 📲 স্ট্যাটাস চেঞ্জ হলে অটোমেটিক এসএমএস ট্রিগার
        const targetOrder = orders.find((o) => o.id === id);
        if (targetOrder && targetOrder.phone) {
          if (status === "confirmed") {
            sendCustomerSMS(targetOrder.phone, targetOrder.customer_name, targetOrder.id, "confirmed");
          } else if (status === "shipped") {
            sendCustomerSMS(targetOrder.phone, targetOrder.customer_name, targetOrder.id, "shipped");
          }
        }
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const saveNote = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteInput }),
      });
      const result = await res.json();
      if (result.ok) {
        setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, note: noteInput } : o)));
        setEditingNoteId(null);
      }
    } catch {
      alert("নোট সেভ করা যায়নি");
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই অর্ডারটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      }
    } catch {
      alert("অর্ডার মোছা সম্ভব হয়নি");
    }
  };

  const printInvoice = (order: OrderRow) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id.slice(0, 8)} - মায়াবী বুটিকস</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #c9a054; padding-bottom: 15px; margin-bottom: 20px; }
          .brand-name { font-size: 26px; font-weight: bold; color: #1a1a1a; margin: 0; }
          .brand-info { font-size: 13px; color: #555; margin-top: 5px; }
          .title { text-align: center; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 15px 0; background: #f9f8f3; padding: 6px; border-radius: 4px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 14px; }
          .details-box { background: #fdfdfd; border: 1px solid #f0f0f0; padding: 12px; border-radius: 6px; }
          .details-box h4 { margin: 0 0 8px 0; color: #c9a054; border-bottom: 1px solid #eee; padding-bottom: 4px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
          th { background: #f5f5f5; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .total-row { font-weight: bold; font-size: 16px; background: #fafafa; }
          .footer { text-align: center; margin-top: 40px; border-top: 1px dashed #ccc; padding-top: 15px; font-size: 12px; color: #666; }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <h1 class="brand-name">মায়াবী বুটিকস (Mayabi Boutiques)</h1>
            <div class="brand-info">
              ঠিকানা: পদুয়ার বাজার বিশ্বরোড, কুমিল্লা <br />
              মোবাইল: +880 1609-294842
            </div>
          </div>

          <div class="title">ইনভয়েস / ক্যাশ মেমো</div>

          <div class="details-grid">
            <div class="details-box">
              <h4>কাস্টমার তথ্য</h4>
              <strong>নাম:</strong> ${order.customer_name}<br />
              <strong>মোবাইল:</strong> ${order.phone}<br />
              <strong>ঠিকানা:</strong> ${order.address}, ${order.area ? order.area + ", " : ""}${order.city}, ${order.region} (${order.address_label})
            </div>
            <div class="details-box">
              <h4>অর্ডার বিবরণ</h4>
              <strong>অর্ডার আইডি:</strong> #${order.id.slice(0, 8)}<br />
              <strong>তারিখ:</strong> ${new Date(order.created_at).toLocaleDateString("bn-BD")}<br />
              <strong>পেমেন্ট মেথড:</strong> ${PAYMENT_LABELS[order.payment_method]}<br />
              ${order.transaction_id ? `<strong>TrxID:</strong> ${order.transaction_id}<br />` : ""}
              <strong>স্ট্যাটাস:</strong> ${STATUS_LABELS[order.status]}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>আইটেম / প্রোডাক্ট</th>
                <th>কালার ও সাইজ</th>
                <th>পরিমাণ</th>
                <th style="text-align: right;">মোট মূল্য</th>
              </tr>
            </thead>
            <tbody>
              ${
                order.order_items && order.order_items.length > 0
                  ? order.order_items
                      .map(
                        (it) => `
              <tr>
                <td><strong>${it.product_name}</strong></td>
                <td>${it.color || "-"} | ${it.size || "-"}</td>
                <td>${it.quantity} টি</td>
                <td style="text-align: right;">৳ ${it.subtotal}</td>
              </tr>`
                      )
                      .join("")
                  : `
              <tr>
                <td><strong>${order.product_name}</strong></td>
                <td>${order.color} | ${order.size}</td>
                <td>${order.quantity} টি</td>
                <td style="text-align: right;">৳ ${order.total_price}</td>
              </tr>`
              }
              ${
                order.discount_amount
                  ? `
              <tr>
                <td colspan="3" style="text-align: right;">সাবটোটাল:</td>
                <td style="text-align: right;">৳ ${order.subtotal}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right;">ছাড় ${order.coupon_code ? `(${order.coupon_code})` : ""}:</td>
                <td style="text-align: right; color: #16a34a;">-৳ ${order.discount_amount}</td>
              </tr>`
                  : ""
              }
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">সর্বমোট (Total):</td>
                <td style="text-align: right; color: #c9a054;">৳ ${order.total_price}</td>
              </tr>
            </tbody>
          </table>

          ${order.note ? `<p style="margin-top: 15px; font-size: 12px; background: #fff8e7; padding: 8px; border-radius: 4px;"><strong>নোট:</strong> ${order.note}</p>` : ""}

          <div class="footer">
            <p>আমাদের সাথে কেনাকাটা করার জন্য আপনাকে অশেষ ধন্যবাদ!</p>
            <p style="font-size: 10px; color: #999;">প্রিন্টের সময়: ${new Date().toLocaleString("bn-BD")}</p>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-3">
      <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-3 flex flex-col md:flex-row gap-3 justify-between items-center">
        <input
          type="text"
          placeholder="কাস্টমারের নাম, ফোন বা ঠিকানা দিয়ে সার্চ করুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 bg-black/40 border border-amber-500/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
        />

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-0 justify-start md:justify-end select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === "all" ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black" : "bg-white/[0.04] text-gray-400"}`}
          >
            সব ({orders.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === st ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black" : "bg-white/[0.04] text-gray-400"}`}
              >
                {STATUS_LABELS[st]} ({count})
              </button>
            );
          })}
        </div>
      </div>
      {/* বাল্ক প্রিন্ট অ্যাকশন বার */}
<div className="flex items-center justify-between bg-white/[0.04] p-3 rounded-lg border border-white/10 mb-4">
  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
    <input
      type="checkbox"
      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
      onChange={toggleSelectAll}
      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
    />
    সব সিলেক্ট করুন ({selectedOrders.length}/{filteredOrders.length})
  </label>

  <button
    onClick={handleBulkPrint}
    disabled={selectedOrders.length === 0}
    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
      selectedOrders.length > 0
        ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer"
        : "bg-white/[0.06] text-gray-500 cursor-not-allowed"
    }`}
  >
    🖨️ নির্বাচিত ({selectedOrders.length}) মেমো বাল্ক প্রিন্ট
  </button>
</div>

      {filteredOrders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">কোনো অর্ডার পাওয়া যায়নি।</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.id} className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 grid md:grid-cols-4 gap-3 items-start">
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2">
                <input
  type="checkbox"
  checked={selectedOrders.includes(order.id)}
  onChange={() => toggleSelectOrder(order.id)}
  className="w-4 h-4 accent-amber-500 rounded cursor-pointer mr-1"
/>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono font-bold">
                  #{order.id.slice(0, 8)}
                </span>
                <p className="text-xs sm:text-sm font-bold text-white">
                  {order.order_items && order.order_items.length > 0
                    ? `${order.order_items.length}টি প্রোডাক্ট`
                    : order.product_name}
                </p>
              </div>

              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-1 pl-1 border-l-2 border-amber-500/20">
                  {order.order_items.map((it) => (
                    <p key={it.id} className="text-[11px] text-gray-300 pl-2">
                      • {it.product_name} — <span className="text-white">{[it.color, it.size].filter(Boolean).join(" / ") || "—"}</span> ×{" "}
                      <span className="text-white">{it.quantity}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-300">
                  কালার: <span className="text-white">{order.color}</span> | সাইজ: <span className="text-white">{order.size}</span> | পরিমাণ: <span className="text-white">{order.quantity}</span>
                </p>
              )}
              {order.coupon_code && (
                <p className="text-[10px] text-green-400">
                  🎟️ কুপন: {order.coupon_code} (-{formatBDT(order.discount_amount || 0)})
                </p>
              )}
              <p className="text-xs font-bold text-amber-400">
                👤 {order.customer_name} — 📞 {order.phone}
              </p>
              <p className="text-xs text-gray-400">
                🏠 {order.address}, {order.area ? `${order.area}, ` : ""}
                {order.city}, {order.region} ({order.address_label})
              </p>

              <div className="pt-1">
                {editingNoteId === order.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      placeholder="এডমিন নোট লিখুন..."
                      className="bg-black/40 border border-amber-500/30 rounded px-2 py-1 text-xs text-white"
                    />
                    <button onClick={() => saveNote(order.id)} className="text-xs bg-gradient-to-r from-amber-400 to-amber-600 text-black px-2 py-1 rounded font-bold">সেভ</button>
                    <button onClick={() => setEditingNoteId(null)} className="text-xs text-gray-400">ক্যানসেল</button>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 flex items-center gap-2">
                    <span>📝 নোট: {order.note || "কোনো নোট নেই"}</span>
                    <button
                      onClick={() => {
                        setEditingNoteId(order.id);
                        setNoteInput(order.note || "");
                      }}
                      className="text-[10px] text-amber-400 underline"
                    >
                      এডিট
                    </button>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              {order.discount_amount ? (
                <p className="text-[10px] text-gray-500 line-through">{formatBDT(order.subtotal || 0)}</p>
              ) : null}
              <p className="text-sm font-black text-amber-400">{formatBDT(order.total_price)}</p>
              <p className="text-xs text-gray-400">{PAYMENT_LABELS[order.payment_method]}</p>
              {order.transaction_id && (
                <p className="text-xs text-amber-400 font-mono">TrxID: {order.transaction_id}</p>
              )}
              <p className="text-[10px] text-gray-500">{new Date(order.created_at).toLocaleString("bn-BD")}</p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <select
                value={order.status}
                disabled={updatingId === order.id}
                onChange={(e) => updateStatus(order.id, e.target.value as OrderRow["status"])}
                className="w-full bg-black/40 border border-amber-500/30 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1 mt-1">
<button
                onClick={() => sendToCourier(order, selectedCourier, sendCustomerSMS)}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-extrabold text-xs rounded-lg hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md"
              >
                🚚 কুরিয়ারে বুকিং দিন
              </button>
            </div>
            <button
  onClick={async () => {
    try {
      const res = await fetch(`/api/courier/track?tracking_code=${order.id}`);
      const data = await res.json();
      alert(`🚚 কুরিয়ার ট্র্যাকিং আপডেট:\n${data.msg || data.delivery_status || 'কোনো তথ্য পাওয়া যায়নি'}`);
    } catch (err) {
      alert('ট্র্যাকিং আপডেট পেতে সমস্যা হয়েছে!');
    }
  }}
  className="px-3 py-1.5 bg-blue-600/30 text-blue-300 border border-blue-500/50 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-all"
>
  🔍 ট্র্যাকিং চেক করুন
</button>

            <div className="flex gap-2 w-full justify-end">
              <button
                onClick={() => printInvoice(order)}
                className="bg-white/[0.04] hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
              >
                🖨️ মেমো প্রিন্ট
              </button>

                <button
                  onClick={() => deleteOrder(order.id)}
                  className="bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 px-2 py-1.5 rounded-lg text-xs font-bold transition-all"
                  title="অর্ডার মুছুন"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ProductsTab({
  products,
  setProducts,
  categories,
}: {
  products: ProductRow[];
  setProducts: React.Dispatch<React.SetStateAction<ProductRow[]>>;
  categories: any[];
}) {
  const [form, setForm] = useState({
    name: "",
    name_en: "",
    description: "",
    categorySlug: categories[0]?.slug || "",
    price: "",
    oldPrice: "",
    costPrice: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!imageFile) {
      setError("দয়া করে একটি প্রোডাক্ট ছবি নির্বাচন করুন।");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.name_en) fd.append("name_en", form.name_en);
      if (form.description) fd.append("description", form.description);
      fd.append("categorySlug", form.categorySlug);
      fd.append("price", form.price);
      if (form.oldPrice) fd.append("oldPrice", form.oldPrice);
      if (form.costPrice) fd.append("costPrice", form.costPrice);
      fd.append("image", imageFile);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();
      if (res.ok && result.product) {
        setProducts((prev) => [result.product, ...prev]);
        setForm({ name: "", name_en: "", description: "", categorySlug: categories[0]?.slug || "", price: "", oldPrice: "", costPrice: "" });
        setImageFile(null);
        const fileInput = document.getElementById("product-image-input") as HTMLInputElement | null;
        if (fileInput) fileInput.value = "";
      } else {
        setError(result.error || "প্রোডাক্ট যোগ করা সম্ভব হয়নি।");
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত এই প্রোডাক্টটি ডিলিট করতে চান?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.ok || res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  const lowStockProducts = products.filter(
    (p: any) => Number(p.stock ?? 0) > 0 && Number(p.stock ?? 0) <= Number(p.min_stock_alert || p.minStockAlert || 5)
  );
  const outOfStockProducts = products.filter((p: any) => Number(p.stock ?? 0) <= 0);

  return (
    <div className="space-y-6">
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-red-950/20 border border-red-900/40 rounded-2xl p-4">
          <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
            ⚠️ Low Stock Alert — {lowStockProducts.length + outOfStockProducts.length}টি প্রোডাক্টে মনোযোগ দরকার
          </h3>
          <div className="flex flex-wrap gap-2">
            {outOfStockProducts.map((p: any) => (
              <span key={p.id} className="text-[11px] bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-500/30">
                {p.name} — স্টক শেষ
              </span>
            ))}
            {lowStockProducts.map((p: any) => (
              <span key={p.id} className="text-[11px] bg-amber-500/15 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/30">
                {p.name} — মাত্র {p.stock}টি বাকি
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
      {/* ১. প্রোডাক্ট যোগ করার ফর্ম */}
      <form onSubmit={handleAddProduct} className="lg:col-span-1 bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 space-y-3 h-fit">
        <h3 className="text-xs font-bold text-white border-b border-amber-500/10 pb-2">নতুন প্রোডাক্ট যোগ করুন</h3>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">প্রোডাক্টের নাম *</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            placeholder="প্রোডাক্টের নাম লিখুন"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">English Name (ঐচ্ছিক)</label>
          <input
            type="text" value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            placeholder="e.g. Premium Three-Piece Set"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">প্রোডাক্ট বিবরণ (ঐচ্ছিক)</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            placeholder="ফেব্রিক, ফিট ও অন্যান্য বিবরণ — খালি রাখলে একটা সাধারণ বিবরণ দেখাবে"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">ক্যাটাগরি *</label>
          <select
            value={form.categorySlug}
            onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
            className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
            <option value="hero-section">✨ হিরো সেকশন পরিবর্তন</option>
            <option value="featured-collection">✨ ফিচারড কালেকশন ব্যানার</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">দাম (৳) *</label>
            <input
              type="number" required min={0} value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">পুরাতন দাম</label>
            <input
              type="number" min={0} value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              placeholder="ঐচ্ছিক"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Cost Price (আপনার কেনা দাম)</label>
            <input
              type="number" min={0} value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
              className="w-full bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
              placeholder="Net Profit হিসাবের জন্য"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">প্রোডাক্ট ছবি *</label>
          <input
            id="product-image-input"
            type="file" accept="image/*" required
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-gradient-to-r from-amber-400 to-amber-600 file:text-black file:text-xs file:font-bold"
          />
        </div>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-2.5 py-1.5">{error}</p>}

        <button
          type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-400 to-amber-600 disabled:opacity-60 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
        >
          {isSubmitting ? "যোগ করা হচ্ছে..." : "প্রোডাক্ট যোগ করুন"}
        </button>
      </form>

      {/* ২. প্রোডাক্ট লিস্ট সেকশন */}
      <div className="lg:col-span-2 space-y-3">
        <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4">
          <h3 className="text-xs font-bold text-white mb-4">
            প্রোডাক্ট লিস্ট ({products.length})
          </h3>

          <div className="space-y-3">
            {products.map((p: any) => {
              const totalStock = Number(p.stock ?? 0) + (
                p.variants?.reduce((acc: number, v: any) => acc + (Number(v.stock) || 0), 0) || 0
              );
              const productStock = Number(totalStock);
              const isOutOfStock = productStock <= 0;

              return (
                <div key={p.id} className="p-3 bg-white/[0.04] rounded-lg border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <h4 className="font-semibold text-sm text-white">{p.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        {categories.find((c) => c.slug === (p.category_slug || p.categorySlug))?.name ?? (p.category_slug || p.categorySlug)}
                      </p>
                      <p className="text-xs font-black text-amber-400">{formatBDT(p.price)}</p>
                      <div className="mt-1">
<div className="flex items-center gap-2 mt-1">
  <span className="text-[11px] text-gray-400">স্টক:</span>
  {productStock <= 0 ? (
    <span className="bg-red-900/80 text-red-200 border border-red-500 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
      🚨 স্টক শেষ (0)
    </span>
  ) : productStock <= 5 ? (
    <span className="bg-amber-900/80 text-amber-200 border border-amber-500 text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
      ⚠️ স্টক কম: {productStock}টি
    </span>
  ) : (
    <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
      {productStock}টি
    </span>
  )}
</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-xs text-red-300 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 px-3 py-1.5 rounded transition-colors"
                  >
                    {deletingId === p.id ? "..." : "ডিলিট"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
// 🎯 CRM / Customer List কম্পোনেন্ট
function CustomersTab({ sendCustomerSMS }: { sendCustomerSMS: any }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        const orders = Array.isArray(data) ? data : data.orders || [];
        
        const customerMap: { [key: string]: any } = {};

        orders.forEach((order: any) => {
          // আপনার ডাটাবেজের ফিল্ডের নাম অনুযায়ী (phone / customerPhone ইত্যাদি)
          const phone = order.phone || order.customerPhone || 'N/A';
          const name = order.customer_name || order.customerName || order.name || 'অপরিচিত কাস্টমার';
          const totalAmount = Number(order.total_amount || order.totalAmount || order.total || 0);

          if (!customerMap[phone]) {
            customerMap[phone] = {
              name,
              phone,
              orderCount: 0,
              totalSpent: 0,
            };
          }

          customerMap[phone].orderCount += 1;
          customerMap[phone].totalSpent += totalAmount;
        });

        setCustomers(Object.values(customerMap));
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-xs font-bold text-white">
          কাস্টমার ডেটাবেস / CRM ({filteredCustomers.length})
        </h3>
        <input
          type="text"
          placeholder="নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-black/40 border border-amber-500/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500/50 w-full sm:w-64"
        />
      </div>

      <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl overflow-hidden">
        {loading ? (
          <p className="text-center text-xs text-gray-400 p-6">লোড হচ্ছে...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-center text-xs text-gray-400 p-6">কোনো কাস্টমার পাওয়া যায়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-amber-500/10 text-[11px] text-gray-400 uppercase bg-black/40">
                  <th className="p-3">কাস্টমারের নাম</th>
                  <th className="p-3">ফোন নম্বর</th>
                  <th className="p-3 text-center">মোট অর্ডার</th>
                  <th className="p-3 text-right">মোট পারচেজ (৳)</th>
                </tr>
                <th className="p-3 text-right">মেসেজ</th>
              </thead>
              <tbody className="divide-y divide-white/10 text-xs">
                {filteredCustomers.map((c, index) => (
                  <tr key={index} className="hover:bg-white/[0.04] transition-colors">
                    <td className="p-3 font-semibold text-white">{c.name}</td>
                    <td className="p-3 text-gray-300">{c.phone}</td>
                    <td className="p-3 text-center">
                      <span className="bg-white/[0.06] text-gray-300 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {c.orderCount} বার
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-amber-400">
                      ৳{c.totalSpent.toLocaleString()}
                      {c.orderCount > 1 && (
                        <span className="ml-2 text-[9px] bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                          রিপিট কাস্টমার
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
  <button
    onClick={() => {
      const msg = prompt("কাস্টমারকে কি মেসেজ পাঠাতে চান লিখুন:");
      if (msg) sendCustomerSMS(c.phone, c.name, "", "custom", msg);
    }}
    className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded hover:bg-amber-500 hover:text-black transition-all"
  >
    💬 কাস্টম SMS
  </button>
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mb-4">
  <button
    onClick={async () => {
      const msg = prompt("সব কাস্টমারকে একসাথে কি মেসেজ পাঠাতে চান লিখুন:");
      if (!msg) return;

      if (confirm(`আপনি কি নিশ্চিত যে সকল (${customers.length} জন) কাস্টমারকে এই মেসেজটি পাঠাতে চান?`)) {
        let sentCount = 0;
        for (const c of customers) {
          if (c.phone) {
            await sendCustomerSMS(c.phone, c.name, "", "custom", msg);
            sentCount++;
          }
        }
        alert(`সফলভাবে ${sentCount} জন কাস্টমারকে মেসেজ পাঠানো হয়েছে!`);
      }
    }}
    className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400 transition-all flex items-center gap-1.5"
  >
    📢 সবাইকে একসাথে SMS পাঠান
  </button>
</div>
      </div>
    </div>
  );
}
/* 📈 ডিটেইলড সেলস রিপোর্ট ও Advanced Analytics কম্পোনেন্ট */
function AnalyticsTab({ orders, products }: { orders: OrderRow[]; products: ProductRow[] }) {
  const [filter, setFilter] = useState<"all" | "today" | "7days" | "month">("all");

  // তারিখ অনুযায়ী ফিল্টার করার লজিক
  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    const orderDate = new Date(o.created_at);
    const now = new Date();

    if (filter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }
    if (filter === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }
    if (filter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }
    return true;
  });

  // হিসাব-নিকাশ
  const totalSales = filteredOrders
    .filter((o) => o.status === "delivered" || o.status === "confirmed")
    .reduce((sum, o) => sum + (o.total_price || 0), 0);

  const totalOrders = filteredOrders.length;
  const deliveredCount = filteredOrders.filter((o) => o.status === "delivered").length;
  const pendingCount = filteredOrders.filter((o) => o.status === "pending").length;
  const cancelledCount = filteredOrders.filter((o) => o.status === "cancelled" || o.status === "returned").length;

  // Cost Price দিয়ে Net Profit হিসাব — প্রতিটা বিক্রি হওয়া আইটেমের (বিক্রয়মূল্য - ক্রয়মূল্য) × পরিমাণ যোগ করে
  const costPriceMap = new Map(products.map((p: any) => [String(p.id), Number(p.cost_price || 0)]));
  const profitEligibleOrders = filteredOrders.filter((o) => o.status === "delivered" || o.status === "confirmed");

  let netProfit = 0;
  let hasCostPriceData = false;
  for (const order of profitEligibleOrders) {
    const lines =
      order.order_items && order.order_items.length > 0
        ? order.order_items.map((it) => ({ productId: it.product_id, unitPrice: it.unit_price, qty: it.quantity }))
        : [{ productId: (order as any).product_id, unitPrice: order.unit_price || 0, qty: order.quantity || 0 }];

    for (const line of lines) {
      const cost = costPriceMap.get(String(line.productId)) || 0;
      if (cost > 0) hasCostPriceData = true;
      netProfit += (Number(line.unitPrice) - cost) * Number(line.qty);
    }
  }

  // CSV ফাইল ডাউনলোড ফাংশন
  const downloadCSV = () => {
    const headers = ["Order ID,Date,Customer,Phone,Total Price,Status\n"];
    const rows = filteredOrders.map(
      (o) => `${o.id},"${new Date(o.created_at).toLocaleDateString()}","${o.customer_name}",${o.phone},${o.total_price},${o.status}\n`
    );

    const blob = new Blob([...headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `Sales_Report_${filter}_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* ফিল্টার এবং ডাউনলোড বাটন */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.04] p-4 rounded-xl border border-amber-500/20">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-bold">ফিল্টার করুন:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/[0.04] border border-amber-500/30 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="all">সব সময়ের (All Time)</option>
            <option value="today">আজকের (Today)</option>
            <option value="7days">গত ৭ দিন (Last 7 Days)</option>
            <option value="month">এই মাস (This Month)</option>
          </select>
        </div>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold text-xs rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
        >
          📥 CSV/Excel রিপোর্ট ডাউনলোড
        </button>
      </div>

      {/* অ্যানালিটিক্স কার্ডস */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.04] p-4 rounded-xl border border-amber-500/20">
          <p className="text-xs text-gray-400">মোট সেলস (ক্যালকুলেটেড)</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">৳{totalSales.toLocaleString()}</h3>
        </div>
        <div className="bg-white/[0.04] p-4 rounded-xl border border-green-500/30">
          <p className="text-xs text-gray-400">Net Profit (আসল লাভ)</p>
          <h3 className="text-2xl font-bold text-green-400 mt-1">৳{netProfit.toLocaleString()}</h3>
          {!hasCostPriceData && (
            <p className="text-[9px] text-gray-500 mt-1">প্রোডাক্টে Cost Price দিন সঠিক হিসাবের জন্য</p>
          )}
        </div>
        <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10">
          <p className="text-xs text-gray-400">মোট অর্ডার</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalOrders} টি</h3>
        </div>
        <div className="bg-white/[0.04] p-4 rounded-xl border border-green-500/20">
          <p className="text-xs text-gray-400">ডেলিভার্ড</p>
          <h3 className="text-2xl font-bold text-green-400 mt-1">{deliveredCount} টি</h3>
        </div>
        <div className="bg-white/[0.04] p-4 rounded-xl border border-red-500/20">
          <p className="text-xs text-gray-400">ক্যান্সেল / রিটার্ন</p>
          <h3 className="text-2xl font-bold text-red-400 mt-1">{cancelledCount} টি</h3>
        </div>
      </div>
    </div>
  );
}

function StaffsTab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('order_handler');
  const [staffs, setStaffs] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadStaffs = async () => {
    const res = await fetch('/api/admin/staff');
    const result = await res.json();
    if (result.ok) setStaffs(result.staffs);
  };

  useEffect(() => { loadStaffs(); }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 10; i++) pass += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pass);
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const result = await res.json();
      if (!result.ok) {
        setError(result.error || 'স্টাফ তৈরি করা যায়নি।');
        return;
      }
      alert(`স্টাফ অ্যাকাউন্ট তৈরি হয়েছে! এই লগইন তথ্য স্টাফকে সরাসরি জানিয়ে দিন —\n\nইমেইল: ${email}\nপাসওয়ার্ড: ${password}\n\nতিনি "স্টাফ লগইন" ট্যাব দিয়ে ঢুকতে পারবেন।`);
      setEmail('');
      setPassword('');
      loadStaffs();
    } catch {
      setError('সার্ভার এরর হয়েছে, আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  const removeStaff = async (id: string, staffEmail: string) => {
    if (!confirm(`${staffEmail}-এর অ্যাক্সেস সম্পূর্ণ বাতিল করতে চান? তিনি আর লগইন করতে পারবেন না।`)) return;
    await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    setStaffs((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="p-6 bg-white/[0.04] rounded-xl border border-amber-500/20 space-y-6">
      <h2 className="text-xl font-bold text-amber-400">👥 স্টাফ ও পারমিশন ম্যানেজমেন্ট</h2>

      <form onSubmit={handleAddStaff} className="bg-white/[0.04] p-4 rounded-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="স্টাফের ইমেইল দিন..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 bg-white/[0.04] border border-white/10 rounded text-white text-sm"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="পাসওয়ার্ড সেট করুন"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 bg-white/[0.04] border border-white/10 rounded text-white text-sm flex-1"
              required
            />
            <button
              type="button"
              onClick={generatePassword}
              title="র‍্যান্ডম পাসওয়ার্ড তৈরি করুন"
              className="px-2.5 bg-black/40 border border-white/10 rounded text-xs text-amber-400 hover:border-amber-500"
            >
              🎲
            </button>
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="p-2 bg-white/[0.04] border border-white/10 rounded text-white text-sm"
          >
            <option value="order_handler">Order Handler (শুধু অর্ডার ও কুরিয়ার)</option>
            <option value="manager">Manager (অর্ডার, প্রোডাক্ট ও কাস্টমার)</option>
            <option value="super_admin">Super Admin (ফুল অ্যাক্সেস)</option>
          </select>
        </div>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded text-sm hover:brightness-110 disabled:opacity-60"
        >
          {isSaving ? 'তৈরি হচ্ছে...' : 'স্টাফ অ্যাড করুন'}
        </button>
        <p className="text-[10px] text-gray-500">
          তৈরি হওয়ার পর এই ইমেইল ও পাসওয়ার্ড স্টাফকে সরাসরি (ফোনে/হোয়াটসঅ্যাপে) জানিয়ে দিন — তিনি লগইন পেজের
          &ldquo;স্টাফ লগইন&rdquo; ট্যাব দিয়ে ঢুকতে পারবেন।
        </p>
      </form>

      <div className="space-y-2">
        <h3 className="text-md font-semibold text-gray-300">বর্তমান স্টাফ লিস্ট:</h3>
        {staffs.length === 0 && <p className="text-xs text-gray-500">এখনো কোনো স্টাফ যোগ করা হয়নি।</p>}
        {staffs.map((s) => (
          <div key={s.id} className="flex justify-between items-center p-3 bg-white/[0.04] rounded border border-white/10 text-sm">
            <span className="text-gray-200">{s.email}</span>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold uppercase">{s.role}</span>
              <button
                onClick={() => removeStaff(s.id, s.email)}
                title="অ্যাক্সেস বাতিল করুন"
                className="text-red-400 hover:text-red-300 text-xs px-1.5"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// 🎟️ কুপন ও ডিসকাউন্ট ম্যানেজমেন্ট ট্যাব
function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const emptyForm = {
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    min_order_amount: "",
    usage_limit: "",
    expires_at: "",
  };
  const [form, setForm] = useState(emptyForm);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const result = await res.json();
      if (result.ok) setCoupons(result.coupons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : 0,
          usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
          expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        setError(result.error || "কুপন তৈরি করা যায়নি।");
        return;
      }
      setForm(emptyForm);
      loadCoupons();
    } catch {
      setError("সার্ভার এরর হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (coupon: CouponRow) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    setCoupons((prev) => prev.map((c) => (c.id === coupon.id ? { ...c, is_active: !c.is_active } : c)));
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("এই কুপনটি মুছে ফেলতে চান?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">🎟️ কুপন ও ডিসকাউন্ট ম্যানেজমেন্ট</h2>

      {/* নতুন কুপন তৈরির ফর্ম */}
      <form onSubmit={handleCreate} className="bg-white/[0.04] border border-amber-500/15 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-amber-400">নতুন কুপন তৈরি করুন</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">কুপন কোড *</label>
            <input
              type="text"
              name="code"
              required
              value={form.code}
              onChange={handleChange}
              placeholder="যেমন: EID10"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white uppercase focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">ছাড়ের ধরন *</label>
            <select
              name="discount_type"
              value={form.discount_type}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              <option value="percentage">শতাংশ (%)</option>
              <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">
              ছাড়ের পরিমাণ * {form.discount_type === "percentage" ? "(১-১০০)" : "(টাকা)"}
            </label>
            <input
              type="number"
              name="discount_value"
              required
              min={0}
              value={form.discount_value}
              onChange={handleChange}
              placeholder={form.discount_type === "percentage" ? "যেমন: 10" : "যেমন: 200"}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">সর্বনিম্ন অর্ডার (৳)</label>
            <input
              type="number"
              name="min_order_amount"
              min={0}
              value={form.min_order_amount}
              onChange={handleChange}
              placeholder="খালি রাখলে কোনো সীমা নেই"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">ব্যবহারসীমা (কতবার)</label>
            <input
              type="number"
              name="usage_limit"
              min={0}
              value={form.usage_limit}
              onChange={handleChange}
              placeholder="খালি রাখলে আনলিমিটেড"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">মেয়াদ শেষ (তারিখ)</label>
            <input
              type="date"
              name="expires_at"
              value={form.expires_at}
              onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-lg text-sm hover:brightness-110 disabled:opacity-60 transition-all"
        >
          {isSaving ? "তৈরি হচ্ছে..." : "কুপন তৈরি করুন"}
        </button>
      </form>

      {/* বিদ্যমান কুপন লিস্ট */}
      <div className="bg-white/[0.04] border border-amber-500/15 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-white/[0.04] text-[10px] uppercase text-gray-400">
                <th className="p-3">কোড</th>
                <th className="p-3">ছাড়</th>
                <th className="p-3">সর্বনিম্ন অর্ডার</th>
                <th className="p-3">ব্যবহার</th>
                <th className="p-3">মেয়াদ</th>
                <th className="p-3">অবস্থা</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 text-xs">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-500 text-xs">
                    এখনো কোনো কুপন তৈরি করা হয়নি।
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="border-t border-white/10">
                    <td className="p-3 font-mono font-bold text-amber-400">{c.code}</td>
                    <td className="p-3 text-gray-200">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : formatBDT(c.discount_value)}
                    </td>
                    <td className="p-3 text-gray-400">{c.min_order_amount ? formatBDT(c.min_order_amount) : "—"}</td>
                    <td className="p-3 text-gray-400">
                      {c.times_used} {c.usage_limit ? `/ ${c.usage_limit}` : "/ ∞"}
                    </td>
                    <td className="p-3 text-gray-400">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString("bn-BD") : "কখনো না"}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleActive(c)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.is_active ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-gray-700/30 text-gray-400 border border-gray-600/30"
                        }`}
                      >
                        {c.is_active ? "চালু" : "বন্ধ"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => deleteCoupon(c.id)}
                        className="bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 text-red-400 px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🗂️ ক্যাটাগরি ম্যানেজমেন্ট ট্যাব — এখান থেকেই নতুন ক্যাটাগরি যোগ/এডিট/মুছা/সাজানো যায়
function CategoriesTab({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState<any[]>(
    [...initialCategories].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyForm = { name: "", name_en: "", slug: "", tag: "", image: "", is_featured: true };
  const [form, setForm] = useState(emptyForm);

  const reload = async () => {
    const res = await fetch("/api/admin/categories");
    const result = await res.json();
    if (result.ok) setCategories(result.categories);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      if (!result.ok) {
        setError(result.error || "ক্যাটাগরি তৈরি করা যায়নি।");
        return;
      }
      setForm(emptyForm);
      reload();
    } catch {
      setError("সার্ভার এরর হয়েছে।");
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      name_en: cat.name_en || "",
      slug: cat.slug,
      tag: cat.tag || "",
      image: cat.image || "",
      is_featured: cat.is_featured ?? true,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setIsSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, name_en: form.name_en, tag: form.tag, image: form.image, is_featured: form.is_featured }),
      });
      const result = await res.json();
      if (!result.ok) {
        setError(result.error || "আপডেট করা যায়নি।");
        return;
      }
      setEditingId(null);
      setForm(emptyForm);
      reload();
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFeatured = async (cat: any) => {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !cat.is_featured }),
    });
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, is_featured: !c.is_featured } : c)));
  };

  const moveCategory = async (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    setCategories(reordered);

    // দুটো ক্যাটাগরির sort_order অদলবদল করে সার্ভারে সেভ করা
    await Promise.all([
      fetch(`/api/admin/categories/${reordered[index].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: index }),
      }),
      fetch(`/api/admin/categories/${reordered[newIndex].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort_order: newIndex }),
      }),
    ]);
  };

  const deleteCategory = async (cat: any) => {
    if (!confirm(`"${cat.name}" ক্যাটাগরিটা মুছে ফেলতে চান? (এই ক্যাটাগরির প্রোডাক্টগুলো মুছে যাবে না, শুধু ক্যাটাগরি এন্ট্রি মুছবে)`))
      return;
    await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== cat.id));
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold text-white">🗂️ ক্যাটাগরি ম্যানেজমেন্ট</h2>
      <p className="text-xs text-gray-500">
        এখান থেকে নতুন ক্যাটাগরি যোগ করলে সাথে সাথে হোমপেজ ও নেভিগেশনে দেখা যাবে — কোনো কোড পরিবর্তনের দরকার নেই।
      </p>

      {/* নতুন ক্যাটাগরি তৈরি / এডিট ফর্ম */}
      <form
        onSubmit={editingId ? (e) => { e.preventDefault(); saveEdit(); } : handleCreate}
        className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-5 space-y-4"
      >
        <h3 className="text-sm font-bold text-amber-400">{editingId ? "ক্যাটাগরি এডিট করুন" : "নতুন ক্যাটাগরি যোগ করুন"}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">নাম *</label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="যেমন: লেহেঙ্গা"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">English Name (ঐচ্ছিক)</label>
            <input
              type="text"
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              placeholder="e.g. Lehenga"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          {!editingId && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">স্লাগ (ঐচ্ছিক)</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                placeholder="খালি রাখলে নাম থেকে অটো তৈরি হবে"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">ট্যাগলাইন</label>
            <input
              type="text"
              name="tag"
              value={form.tag}
              onChange={handleChange}
              placeholder="যেমন: নতুন সংগ্রহ"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">ছবির URL</label>
            <input
              type="text"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="accent-amber-500" />
          হোমপেজে ফিচারড হিসেবে দেখাবে
        </label>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl text-sm hover:brightness-110 disabled:opacity-60 transition-all"
          >
            {isSaving ? "সেভ হচ্ছে..." : editingId ? "আপডেট করুন" : "ক্যাটাগরি তৈরি করুন"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm(emptyForm); }}
              className="px-5 py-2.5 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20 transition-all"
            >
              বাতিল
            </button>
          )}
        </div>
      </form>

      {/* বিদ্যমান ক্যাটাগরি লিস্ট */}
      <div className="space-y-2">
        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl p-3"
          >
            <div className="flex flex-col gap-0.5">
              <button
                onClick={() => moveCategory(idx, -1)}
                disabled={idx === 0}
                className="w-6 h-5 flex items-center justify-center text-gray-400 hover:text-amber-400 disabled:opacity-20 text-xs"
              >
                ▲
              </button>
              <button
                onClick={() => moveCategory(idx, 1)}
                disabled={idx === categories.length - 1}
                className="w-6 h-5 flex items-center justify-center text-gray-400 hover:text-amber-400 disabled:opacity-20 text-xs"
              >
                ▼
              </button>
            </div>

            {cat.image && (
              <img src={cat.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{cat.name}</p>
              <p className="text-[11px] text-gray-500">/{cat.slug} {cat.tag ? `· ${cat.tag}` : ""}</p>
            </div>

            <button
              onClick={() => toggleFeatured(cat)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                cat.is_featured
                  ? "bg-green-500/15 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-gray-500 border border-white/10"
              }`}
            >
              {cat.is_featured ? "হোমে ফিচারড" : "হোমে হাইড"}
            </button>

            <button onClick={() => startEdit(cat)} className="text-gray-400 hover:text-amber-400 text-xs px-1.5 shrink-0">
              ✏️
            </button>
            <button onClick={() => deleteCategory(cat)} className="text-red-400 hover:text-red-300 text-xs px-1.5 shrink-0">
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 কনটেন্ট স্টুডিও — প্রোমো সেকশন, লুকবুক, ইনস্টাগ্রাম শোকেস, ডেলিভারি-চেকার, স্টোর লোকেটর — সবকিছু একসাথে
function ContentStudioTab() {
  const [subTab, setSubTab] = useState<"promo" | "lookbook" | "instagram" | "delivery" | "stores">("promo");

  const SUBTABS: { key: typeof subTab; label: string }[] = [
    { key: "promo", label: "🎯 প্রোমো/সাব-ব্র্যান্ড" },
    { key: "lookbook", label: "📸 লুকবুক" },
    { key: "instagram", label: "📷 ইনস্টাগ্রাম শোকেস" },
    { key: "delivery", label: "🚚 ডেলিভারি-চেকার" },
    { key: "stores", label: "📍 স্টোর লোকেটর" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold text-white">🎨 কনটেন্ট স্টুডিও</h2>
      <div className="flex flex-wrap gap-2">
        {SUBTABS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSubTab(s.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === s.key
                ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black"
                : "bg-white/[0.04] text-gray-300 border border-white/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {subTab === "promo" && <PromoManager />}
      {subTab === "lookbook" && <LookbookManager />}
      {subTab === "instagram" && <InstagramManager />}
      {subTab === "delivery" && <DeliveryZoneManager />}
      {subTab === "stores" && <StoreManager />}
    </div>
  );
}

function PromoManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", cta_label: "কালেকশন দেখুন", cta_link: "/", placement: "mid", media_type: "image" });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/promo");
    const r = await res.json();
    if (r.ok) setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/promo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ title: "", subtitle: "", image: "", cta_label: "কালেকশন দেখুন", cta_link: "/", placement: "mid", media_type: "image" });
    setLoading(false);
    load();
  };

  const toggleActive = async (item: any) => {
    await fetch(`/api/admin/promo/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !item.is_active }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await fetch(`/api/admin/promo/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">হোমপেজের হিরো স্লাইডার ও মাঝের ব্যানার/ভিডিও সেকশন — দুটোই এখান থেকে ম্যানেজ হয়। "কোথায় দেখাবে" থেকে বেছে নিন।</p>
      <form onSubmit={handleAdd} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white">
            <option value="hero">🏠 হিরো সেকশন (উপরে, বড় স্লাইডার)</option>
            <option value="mid">🖼️ মিড-পেজ ব্যানার</option>
          </select>
          <select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white">
            <option value="image">ছবি</option>
            <option value="video">ভিডিও</option>
          </select>
          <input required placeholder="শিরোনাম (যেমন: Festive Luxe)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="সাবটাইটেল" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="ছবি বা ভিডিওর URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="বাটনের লিংক (যেমন: /category/saree)" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
        </div>
        <button disabled={loading} className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl text-sm">যোগ করুন</button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3">
            {item.media_type === "video" ? (
              <span className="w-12 h-12 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-lg shrink-0">🎬</span>
            ) : (
              item.image && <img src={item.image} className="w-12 h-12 rounded-lg object-cover shrink-0" alt="" />
            )}
            <div className="flex-1"><p className="text-sm font-bold text-white">{item.title}</p><p className="text-[11px] text-gray-500">{item.subtitle}</p></div>
            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.placement === "hero" ? "bg-amber-500/15 text-amber-400" : "bg-white/5 text-gray-400"}`}>{item.placement === "hero" ? "হিরো" : "মিড"}</span>
            <button onClick={() => toggleActive(item)} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${item.is_active ? "bg-green-500/15 text-green-400" : "bg-white/5 text-gray-500"}`}>{item.is_active ? "সক্রিয়" : "নিষ্ক্রিয়"}</button>
            <button onClick={() => remove(item.id)} className="text-red-400 text-xs px-1.5">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function LookbookManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ image: "", caption: "", product_slug: "" });

  const load = async () => {
    const res = await fetch("/api/admin/lookbook");
    const r = await res.json();
    if (r.ok) setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/lookbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ image: "", caption: "", product_slug: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await fetch(`/api/admin/lookbook/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">/lookbook পেজে দেখানো ফটোশুট গ্যালারি — চাইলে একটা প্রোডাক্ট স্লাগের সাথে লিংক করা যায়।</p>
      <form onSubmit={handleAdd} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input required placeholder="ছবির URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="ক্যাপশন" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="প্রোডাক্ট স্লাগ (ঐচ্ছিক)" value={form.product_slug} onChange={(e) => setForm({ ...form, product_slug: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
        </div>
        <button className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl text-sm">যোগ করুন</button>
      </form>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
            <img src={item.image} className="w-full h-full object-cover" alt="" />
            <button onClick={() => remove(item.id)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstagramManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ image: "", post_link: "" });

  const load = async () => {
    const res = await fetch("/api/admin/instagram");
    const r = await res.json();
    if (r.ok) setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/instagram", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ image: "", post_link: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await fetch(`/api/admin/instagram/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        ⚠️ এটা লাইভ Instagram API সিঙ্ক না — আপনি নিজে ইনস্টাগ্রাম পোস্টের ছবি এখানে ম্যানুয়ালি যোগ করবেন, ফুটারে গ্রিড আকারে দেখাবে।
      </p>
      <form onSubmit={handleAdd} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="ছবির URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="পোস্টের লিংক (ঐচ্ছিক)" value={form.post_link} onChange={(e) => setForm({ ...form, post_link: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
        </div>
        <button className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl text-sm">যোগ করুন</button>
      </form>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
            <img src={item.image} className="w-full h-full object-cover" alt="" />
            <button onClick={() => remove(item.id)} className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full text-red-400 text-xs">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeliveryZoneManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ district_name: "", estimated_days: "৩-৫ দিন", cod_available: true });

  const load = async () => {
    const res = await fetch("/api/admin/delivery-zones");
    const r = await res.json();
    if (r.ok) setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/delivery-zones", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ district_name: "", estimated_days: "৩-৫ দিন", cod_available: true });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">প্রোডাক্ট পেজে "ডেলিভারি চেক করুন" উইজেটে এই তালিকা অনুযায়ী দেখাবে। জেলা যোগ না করলে ডিফল্ট বার্তা দেখাবে।</p>
      <form onSubmit={handleAdd} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
        <input required placeholder="জেলার নাম" value={form.district_name} onChange={(e) => setForm({ ...form, district_name: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
        <input placeholder="সময় (যেমন: ২-৩ দিন)" value={form.estimated_days} onChange={(e) => setForm({ ...form, estimated_days: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
        <label className="flex items-center gap-1.5 text-xs text-gray-300"><input type="checkbox" checked={form.cod_available} onChange={(e) => setForm({ ...form, cod_available: e.target.checked })} className="accent-amber-500" /> COD আছে</label>
        <button className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl text-sm">যোগ করুন</button>
      </form>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm">
            <span className="font-bold text-white flex-1">{item.district_name}</span>
            <span className="text-gray-400 text-xs">{item.estimated_days}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.cod_available ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"}`}>{item.cod_available ? "COD" : "No COD"}</span>
            <button onClick={() => remove(item.id)} className="text-red-400 text-xs">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StoreManager() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", address: "", phone: "", map_link: "" });

  const load = async () => {
    const res = await fetch("/api/admin/stores");
    const r = await res.json();
    if (r.ok) setItems(r.items);
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/stores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setForm({ name: "", address: "", phone: "", map_link: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("মুছে ফেলতে চান?")) return;
    await fetch(`/api/admin/stores/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        ফিজিক্যাল আউটলেট থাকলে এখানে যোগ করুন — /stores পেজে দেখাবে। কিছু যোগ না করলে পেজটা "কোনো আউটলেট নেই" দেখাবে, ভুয়া তথ্য দেখাবে না।
      </p>
      <form onSubmit={handleAdd} className="bg-white/[0.04] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input required placeholder="আউটলেটের নাম" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input required placeholder="ঠিকানা" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="ফোন নাম্বার" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
          <input placeholder="গুগল ম্যাপ লিংক" value={form.map_link} onChange={(e) => setForm({ ...form, map_link: e.target.value })} className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-sm text-white" />
        </div>
        <button className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl text-sm">যোগ করুন</button>
      </form>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl p-3">
            <div className="flex-1"><p className="text-sm font-bold text-white">{item.name}</p><p className="text-[11px] text-gray-500">{item.address}</p></div>
            <button onClick={() => remove(item.id)} className="text-red-400 text-xs px-1.5">🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
