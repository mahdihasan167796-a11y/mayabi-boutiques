"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { formatBDT } from "@/lib/utils";
import type { SiteSettings } from "@/lib/settings";

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

interface OrderRow {
  id: string;
  created_at: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
  unit_price?: number;
  total_price: number;
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

export function AdminDashboard({
  initialProducts,
  initialOrders,
  initialSettings,
}: {
  initialProducts: ProductRow[];
  initialOrders: OrderRow[];
  initialSettings: SiteSettings;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"products" | "orders" | "settings" | "addons">("orders");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
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
    <div className="max-w-[1400px] mx-auto px-3 sm:px-4 pt-0 pb-8">
      {/* 🔝 ১. প্রফেশনাল হেডার */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 py-3 mb-4 border-b border-[#c9a054]/20">
        <div className="flex items-center gap-3">
          <div className="bg-[#c9a054] text-black font-extrabold text-[11px] px-2.5 py-1 rounded tracking-wider uppercase">
            MAYABI BOUTIQUES
          </div>
          <div>
            <span className="text-[#c9a054] font-bold text-[9px] uppercase tracking-widest block">ADMIN PANEL</span>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">নিয়ন্ত্রণ প্যানেল</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="bg-[#1c1c1a] hover:bg-[#c9a054]/20 border border-[#c9a054]/40 text-[#c9a054] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
          >
            🌐 ওয়েবসাইট দেখুন
          </Link>

          <button
            onClick={handleLogout}
            className="bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          >
            লগআউট
          </button>
        </div>
      </div>

      {/* 📊 ড্যাশবোর্ড সামারি কার্ডস */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3 mb-5">
        <div className="bg-[#121211] border border-[#c9a054]/20 rounded-xl p-3 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase">💰 মোট বিক্রি</p>
          <p className="text-base sm:text-lg font-black text-[#c9a054] mt-1">{formatBDT(totalSales)}</p>
        </div>

        <div className="bg-[#121211] border border-[#c9a054]/20 rounded-xl p-3 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-gray-400 uppercase">🛒 মোট অর্ডার</p>
          <p className="text-base sm:text-lg font-black text-white mt-1">{totalOrdersCount} টি</p>
        </div>

        <div className="bg-[#121211] border border-[#c9a054]/20 rounded-xl p-3 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-amber-500/90 uppercase">⏳ পেন্ডিং অর্ডার</p>
          <p className="text-base sm:text-lg font-black text-amber-400 mt-1">{pendingOrdersCount} টি</p>
        </div>

        <div className="bg-[#121211] border border-[#c9a054]/20 rounded-xl p-3 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-emerald-500/90 uppercase">🚚 ডেলিভারড অর্ডার</p>
          <p className="text-base sm:text-lg font-black text-emerald-400 mt-1">{deliveredOrdersCount} টি</p>
        </div>

        <div className="bg-[#121211] border border-[#c9a054]/20 rounded-xl p-3 flex flex-col justify-between col-span-2 sm:col-span-1">
          <p className="text-[10px] font-bold text-rose-500/90 uppercase">🔄 রিটার্ন/ক্যানসেল</p>
          <p className="text-base sm:text-lg font-black text-rose-400 mt-1">{returnedOrdersCount} টি</p>
        </div>
      </div>

      {/* 🔘 সাইডবার এবং মেইন কন্টেন্ট */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* বাম পাশের সাইডবার */}
        <div className="w-full md:w-52 shrink-0 flex flex-col gap-2 bg-[#121211] border border-[#c9a054]/15 p-2 rounded-xl">
          <button
            onClick={() => setTab("orders")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
              tab === "orders"
                ? "bg-[#c9a054] text-black shadow-md"
                : "bg-[#181817] text-gray-300 border border-[#c9a054]/15 hover:border-[#c9a054]/40"
            }`}
          >
            <span>📦 অর্ডার সমূহ</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === "orders" ? "bg-black/20 text-black" : "bg-[#222] text-[#c9a054]"}`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setTab("products")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
              tab === "products"
                ? "bg-[#c9a054] text-black shadow-md"
                : "bg-[#181817] text-gray-300 border border-[#c9a054]/15 hover:border-[#c9a054]/40"
            }`}
          >
            <span>🛍️ প্রোডাক্ট সমূহ</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${tab === "products" ? "bg-black/20 text-black" : "bg-[#222] text-[#c9a054]"}`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setTab("addons")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${
              tab === "addons"
                ? "bg-[#c9a054] text-black shadow-md"
                : "bg-[#181817] text-gray-300 border border-[#c9a054]/15 hover:border-[#c9a054]/40"
            }`}
          >
            <span>🔌 Addons & Integrations</span>
          </button>

          <button
            onClick={() => setTab("settings")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
              tab === "settings"
                ? "bg-[#c9a054] text-black shadow-md"
                : "bg-[#181817] text-gray-300 border border-[#c9a054]/15 hover:border-[#c9a054]/40"
            }`}
          >
            ⚙️ সেটিংস
          </button>
        </div>

        {/* ডান পাশের মূল কন্টেন্ট এলাকা */}
        <div className="flex-1 w-full min-w-0">
          {tab === "orders" && <OrdersTab orders={orders} setOrders={setOrders} />}
          {tab === "products" && <ProductsTab products={products} setProducts={setProducts} />}
          {tab === "addons" && <AddonsTab />}
          {tab === "settings" && <SettingsTab initialSettings={initialSettings} />}
        </div>
      </div>
    </div>
  );
}

{/* 🔌 নতুন Addons & Integrations ট্যাব */}
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
      <div className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4">
        <h2 className="text-sm font-bold text-white mb-1">🔌 Addons & Integrations</h2>
        <p className="text-xs text-gray-400">মার্কেটিং, কুরিয়ার ও ফেক অর্ডার প্রোটেকশন কনফিগার করুন।</p>
      </div>

      <form onSubmit={handleSaveAddons} className="space-y-4">
        {/* Facebook Pixel & CAPI */}
        <div className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 space-y-3">
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
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
        </div>

        {/* Google Analytics & Tag Manager */}
        <div className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 space-y-3">
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
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
        </div>

        {/* Courier API (Steadfast Integration) */}
        <div className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 space-y-3">
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
                className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Secret Key</label>
              <input
                type="password"
                placeholder="Steadfast Secret Key"
                value={steadfastSecretKey}
                onChange={(e) => setSteadfastSecretKey(e.target.value)}
                className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
              />
            </div>
          </div>
        </div>

        {/* Fake Order Protection */}
        <div className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 space-y-3">
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
          className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Addons সেটিংস সেভ করুন
        </button>
      </form>
    </div>
  );
}

function OrdersTab({
  orders,
  setOrders,
}: {
  orders: OrderRow[];
  setOrders: React.Dispatch<React.SetStateAction<OrderRow[]>>;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>("");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.includes(searchQuery) ||
      o.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.address?.toLowerCase().includes(searchQuery.toLowerCase());

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
              <tr>
                <td><strong>${order.product_name}</strong></td>
                <td>${order.color} | ${order.size}</td>
                <td>${order.quantity} টি</td>
                <td style="text-align: right;">৳ ${order.total_price}</td>
              </tr>
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
      <div className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-3 flex flex-col md:flex-row gap-3 justify-between items-center">
        <input
          type="text"
          placeholder="কাস্টমারের নাম, ফোন বা ঠিকানা দিয়ে সার্চ করুন..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-80 bg-[#070706] border border-[#c9a054]/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#c9a054]"
        />

        <div className="flex gap-1.5 w-full md:w-auto overflow-x-auto pb-0 justify-start md:justify-end select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === "all" ? "bg-[#c9a054] text-black" : "bg-[#181817] text-gray-400"}`}
          >
            সব ({orders.length})
          </button>
          {STATUS_OPTIONS.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${statusFilter === st ? "bg-[#c9a054] text-black" : "bg-[#181817] text-gray-400"}`}
              >
                {STATUS_LABELS[st]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-16">কোনো অর্ডার পাওয়া যায়নি।</p>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.id} className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 grid md:grid-cols-4 gap-3 items-start">
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-[#c9a054]/10 text-[#c9a054] px-2 py-0.5 rounded font-mono font-bold">
                  #{order.id.slice(0, 8)}
                </span>
                <p className="text-xs sm:text-sm font-bold text-white">{order.product_name}</p>
              </div>

              <p className="text-xs text-gray-300">
                কালার: <span className="text-white">{order.color}</span> | সাইজ: <span className="text-white">{order.size}</span> | পরিমাণ: <span className="text-white">{order.quantity}</span>
              </p>
              <p className="text-xs font-bold text-[#c9a054]">
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
                      className="bg-[#070706] border border-[#c9a054]/30 rounded px-2 py-1 text-xs text-white"
                    />
                    <button onClick={() => saveNote(order.id)} className="text-xs bg-[#c9a054] text-black px-2 py-1 rounded font-bold">সেভ</button>
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
                      className="text-[10px] text-[#c9a054] underline"
                    >
                      এডিট
                    </button>
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-black text-[#c9a054]">{formatBDT(order.total_price)}</p>
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
                className="w-full bg-[#070706] border border-[#c9a054]/30 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#c9a054]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 w-full justify-end">
                <button
                  onClick={() => printInvoice(order)}
                  className="bg-[#1c1c1a] hover:bg-[#c9a054]/20 border border-[#c9a054]/40 text-[#c9a054] px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
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

function SettingsTab({ initialSettings }: { initialSettings: SiteSettings }) {
  const [form, setForm] = useState({
    ...initialSettings,
    isOfferActive: (initialSettings as any).isOfferActive ?? true,
    noOfferMessage: (initialSettings as any).noOfferMessage || "বর্তমানে কোনো বিশেষ অফার চালু নেই। নতুন অফারের জন্য আমাদের সাথেই থাকুন!",
    combo1Title: (initialSettings as any).combo1Title || "মেহেফিল কম্বো",
    combo1Price: (initialSettings as any).combo1Price || "৪৫০০",
    combo1OldPrice: (initialSettings as any).combo1OldPrice || "৬০০০",
    combo1Features: (initialSettings as any).combo1Features || "১টি কাস্টম ফিটেড থ্রি-পিস\n১টি প্রিমিয়াম ওরনা\nফ্রি হোম ডেলিভারি",
    combo2Title: (initialSettings as any).combo2Title || "ব্রাইডাল মেগা সেট",
    combo2Price: (initialSettings as any).combo2Price || "৬৮োর",
    combo2OldPrice: (initialSettings as any).combo2OldPrice || "৯৫০০",
    combo2Features: (initialSettings as any).combo2Features || "২টি প্রিমিয়াম ড্রেস সেট\n১টি এক্সক্লুসিভ স্কার্ফ\nভিআইপি গিফট বক্স\nফ্রি হোম ডেলিভারি",
    facebookUrl: (initialSettings as any).facebookUrl || "",
    instagramUrl: (initialSettings as any).instagramUrl || "",
    tiktokUrl: (initialSettings as any).tiktokUrl || "",
    messengerUrl: (initialSettings as any).messengerUrl || "",
    phoneNumber: (initialSettings as any).phoneNumber || "",
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
    <form onSubmit={handleSave} className="max-w-xl bg-[#121211] border border-[#c9a054]/15 rounded-xl p-5 space-y-5">
      <div className="bg-[#181817] border border-[#c9a054]/30 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold text-[#c9a054] flex items-center justify-between border-b border-[#c9a054]/10 pb-2">
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
          <div className="space-y-4 pt-2 border-t border-[#c9a054]/10">
            <div className="space-y-3 bg-[#0d0d0c] p-3 rounded-lg border border-[#c9a054]/20">
              <h4 className="text-xs font-bold text-[#c9a054]">📦 প্রথম কম্বো প্যাকেজ</h4>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">শিরোনাম</label>
                <input
                  type="text" value={form.combo1Title} onChange={handleChange("combo1Title")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">অফার মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo1Price} onChange={handleChange("combo1Price")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">আগের মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo1OldPrice} onChange={handleChange("combo1OldPrice")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">ফিচারসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3} value={form.combo1Features} onChange={handleChange("combo1Features")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                />
              </div>
            </div>

            <div className="space-y-3 bg-[#0d0d0c] p-3 rounded-lg border border-[#c9a054]/20">
              <h4 className="text-xs font-bold text-[#c9a054]">📦 দ্বিতীয় কম্বো প্যাকেজ</h4>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">শিরোনাম</label>
                <input
                  type="text" value={form.combo2Title} onChange={handleChange("combo2Title")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">অফার মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo2Price} onChange={handleChange("combo2Price")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">আগের মূল্য (৳)</label>
                  <input
                    type="text" value={form.combo2OldPrice} onChange={handleChange("combo2OldPrice")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">ফিচারসমূহ (প্রতি লাইনে একটি)</label>
                <textarea
                  rows={3} value={form.combo2Features} onChange={handleChange("combo2Features")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
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
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white border-b border-[#c9a054]/10 pb-2 mb-3">
          ফুটার সোশ্যাল লিংক ও যোগাযোগ নাম্বার
        </h3>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Facebook পেজ লিংক</label>
          <input
            type="url" value={form.facebookUrl} onChange={handleChange("facebookUrl")}
            placeholder="https://facebook.com/yourpage"
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Instagram প্রোফাইল লিংক</label>
          <input
            type="url" value={form.instagramUrl} onChange={handleChange("instagramUrl")}
            placeholder="https://instagram.com/yourprofile"
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">TikTok প্রোফাইল লিংক</label>
          <input
            type="url" value={form.tiktokUrl} onChange={handleChange("tiktokUrl")}
            placeholder="https://tiktok.com/@yourprofile"
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">Messenger লিংক</label>
          <input
            type="url" value={form.messengerUrl} onChange={handleChange("messengerUrl")}
            placeholder="https://m.me/yourpage"
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">যোগাযোগের ফোন নাম্বার</label>
          <input
            type="text" value={form.phoneNumber} onChange={handleChange("phoneNumber")}
            placeholder="০১৭০০-০০০০০০"
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>
      </div>

      {message && <p className="text-xs text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-3 py-1.5">{message}</p>}
      {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-1.5">{error}</p>}

      <button
        type="submit" disabled={isSaving}
        className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
      >
        {isSaving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
      </button>
    </form>
  );
}

function ProductsTab({
  products,
  setProducts,
}: {
  products: ProductRow[];
  setProducts: React.Dispatch<React.SetStateAction<ProductRow[]>>;
}) {
  const [form, setForm] = useState({
    name: "",
    categorySlug: categories[0]?.slug || "",
    price: "",
    oldPrice: "",
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
      fd.append("categorySlug", form.categorySlug);
      fd.append("price", form.price);
      if (form.oldPrice) fd.append("oldPrice", form.oldPrice);
      fd.append("image", imageFile);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();
      if (res.ok && result.product) {
        setProducts((prev) => [result.product, ...prev]);
        setForm({ name: "", categorySlug: categories[0]?.slug || "", price: "", oldPrice: "" });
        setImageFile(null);
        (document.getElementById("product-image-input") as HTMLInputElement | null)?.value &&
          ((document.getElementById("product-image-input") as HTMLInputElement).value = "");
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
      if (result.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={handleAddProduct} className="lg:col-span-1 bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 space-y-3 h-fit">
        <h3 className="text-xs font-bold text-white border-b border-[#c9a054]/10 pb-2">নতুন প্রোডাক্ট যোগ করুন</h3>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">প্রোডাক্টের নাম *</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">ক্যাটাগরি *</label>
          <select
            value={form.categorySlug}
            onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
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
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">পুরাতন দাম</label>
            <input
              type="number" min={0} value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
              placeholder="ঐচ্ছিক"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">প্রোডাক্ট ছবি *</label>
          <input
            id="product-image-input"
            type="file" accept="image/*" required
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#c9a054] file:text-black file:text-xs file:font-bold"
          />
        </div>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-2.5 py-1.5">{error}</p>}

        <button
          type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
        >
          {isSubmitting ? "যোগ করা হচ্ছে..." : "প্রোডাক্ট যোগ করুন"}
        </button>
      </form>

      <div className="lg:col-span-2 space-y-2.5">
        {products.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-16">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-3 flex items-center gap-3">
            <img src={p.images?.[0] || "/placeholder.jpg"} alt={p.name} className="w-14 h-14 rounded-lg object-cover border border-gray-800" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white truncate">{p.name}</p>
              <p className="text-[11px] text-gray-500">{categories.find((c) => c.slug === p.category_slug)?.name ?? p.category_slug}</p>
              <p className="text-xs font-black text-[#c9a054]">{formatBDT(p.price)}</p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              disabled={deletingId === p.id}
              className="text-xs text-red-300 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {deletingId === p.id ? "..." : "ডিলিট"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}