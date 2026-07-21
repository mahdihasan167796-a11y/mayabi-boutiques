"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
}

const STATUS_OPTIONS: OrderRow["status"][] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const STATUS_LABELS: Record<OrderRow["status"], string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
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
  const [tab, setTab] = useState<"products" | "orders" | "settings">("orders");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 border-b border-[#c9a054]/20 pb-6">
        <div>
          <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-1">ADMIN PANEL</span>
          <h1 className="text-2xl font-extrabold text-white">মায়াবী বুটিকস — নিয়ন্ত্রণ প্যানেল</h1>
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#1c1c1a] hover:bg-red-900/40 border border-red-900/40 text-red-300 px-5 py-2 rounded-lg text-xs font-bold transition-all"
        >
          লগআউট
        </button>
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setTab("orders")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${tab === "orders" ? "bg-[#c9a054] text-black" : "bg-[#181817] text-gray-400 border border-[#c9a054]/15"}`}
        >
          অর্ডার সমূহ ({orders.length})
        </button>
        <button
          onClick={() => setTab("products")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${tab === "products" ? "bg-[#c9a054] text-black" : "bg-[#181817] text-gray-400 border border-[#c9a054]/15"}`}
        >
          প্রোডাক্ট সমূহ ({products.length})
        </button>
        <button
          onClick={() => setTab("settings")}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${tab === "settings" ? "bg-[#c9a054] text-black" : "bg-[#181817] text-gray-400 border border-[#c9a054]/15"}`}
        >
          সেটিংস
        </button>
      </div>

      {tab === "orders" && <OrdersTab orders={orders} setOrders={setOrders} />}
      {tab === "products" && <ProductsTab products={products} setProducts={setProducts} />}
      {tab === "settings" && <SettingsTab initialSettings={initialSettings} />}
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
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  if (orders.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-16">এখনো কোনো অর্ডার আসেনি।</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-5 grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-1">
            <p className="text-sm font-bold text-white">{order.product_name}</p>
            <p className="text-xs text-gray-400">
              কালার: {order.color} | সাইজ: {order.size} | পরিমাণ: {order.quantity}
            </p>
            <p className="text-xs text-gray-400">
              {order.customer_name} — {order.phone}
            </p>
            <p className="text-xs text-gray-500">
              {order.address}, {order.area ? `${order.area}, ` : ""}
              {order.city}, {order.region} ({order.address_label})
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-black text-[#c9a054]">{formatBDT(order.total_price)}</p>
            <p className="text-xs text-gray-400">{PAYMENT_LABELS[order.payment_method]}</p>
            {order.transaction_id && (
              <p className="text-xs text-gray-500">TrxID: {order.transaction_id}</p>
            )}
            <p className="text-[10px] text-gray-600">{new Date(order.created_at).toLocaleString("bn-BD")}</p>
          </div>

          <div className="flex items-start justify-end">
            <select
              value={order.status}
              disabled={updatingId === order.id}
              onChange={(e) => updateStatus(order.id, e.target.value as OrderRow["status"])}
              className="bg-[#070706] border border-[#c9a054]/30 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#c9a054]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsTab({ initialSettings }: { initialSettings: SiteSettings }) {
  const [form, setForm] = useState({
    ...initialSettings,
    isOfferActive: (initialSettings as any).isOfferActive ?? true,
    noOfferMessage: (initialSettings as any).noOfferMessage || "বর্তমানে কোনো বিশেষ অফার চালু নেই। নতুন অফারের জন্য আমাদের সাথেই থাকুন!",
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
    <form onSubmit={handleSave} className="max-w-xl bg-[#121211] border border-[#c9a054]/15 rounded-xl p-6 space-y-6">
      
      {/* --- স্পেশাল অফার কন্ট্রোল সেকশন --- */}
      <div className="bg-[#181817] border border-[#c9a054]/30 rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-[#c9a054] flex items-center justify-between border-b border-[#c9a054]/10 pb-2">
          🎁 কম্বো অফার কন্ট্রোল
        </h3>

        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300">অফার স্ট্যাটাস (On/Off):</label>
          <button
            type="button"
            onClick={() => setForm({ ...form, isOfferActive: !form.isOfferActive })}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              form.isOfferActive ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {form.isOfferActive ? "অফার চালু আছে (Active)" : "অফার বন্ধ আছে (Inactive)"}
          </button>
        </div>

        {!form.isOfferActive && (
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">
              অফার না থাকলে যে বার্তাটি দেখানো হবে:
            </label>
            <textarea
              rows={2}
              value={form.noOfferMessage}
              onChange={handleChange("noOfferMessage")}
              placeholder="অফার না থাকলে কি লিখা থাকবে..."
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
        )}
      </div>

      {/* --- সোশ্যাল ও কন্টাক্ট সেকশন --- */}
      <div>
        <h3 className="text-sm font-bold text-white border-b border-[#c9a054]/10 pb-3 mb-3">
          ফুটার সোশ্যাল লিংক ও যোগাযোগ নাম্বার
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Facebook পেজ লিংক</label>
            <input
              type="url" value={form.facebookUrl} onChange={handleChange("facebookUrl")}
              placeholder="https://facebook.com/yourpage"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Instagram প্রোফাইল লিংক</label>
            <input
              type="url" value={form.instagramUrl} onChange={handleChange("instagramUrl")}
              placeholder="https://instagram.com/yourprofile"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">TikTok প্রোফাইল লিংক</label>
            <input
              type="url" value={form.tiktokUrl} onChange={handleChange("tiktokUrl")}
              placeholder="https://tiktok.com/@yourprofile"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">Messenger লিংক</label>
            <input
              type="url" value={form.messengerUrl} onChange={handleChange("messengerUrl")}
              placeholder="https://m.me/yourpage"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">যোগাযোগের ফোন নাম্বার</label>
            <input
              type="text" value={form.phoneNumber} onChange={handleChange("phoneNumber")}
              placeholder="০১৭০০-০০০০০০"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
        </div>
      </div>

      {message && <p className="text-xs text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-3 py-2">{message}</p>}
      {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}

      <button
        type="submit" disabled={isSaving}
        className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-xs py-3 rounded-xl transition-all cursor-pointer"
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
  const [form, setForm] = useState({ name: "", categorySlug: categories[0].slug, price: "", oldPrice: "" });
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

      const res = await fetch("/api/admin/products", { method: "POST", body: fd });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        setError(result.error || "প্রোডাক্ট যোগ করা যায়নি।");
        return;
      }

      setProducts((prev) => [result.product, ...prev]);
      setForm({ name: "", categorySlug: categories[0].slug, price: "", oldPrice: "" });
      setImageFile(null);
      (document.getElementById("product-image-input") as HTMLInputElement | null)?.value &&
        ((document.getElementById("product-image-input") as HTMLInputElement).value = "");
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
    <div className="grid lg:grid-cols-3 gap-8">
      {/* নতুন প্রোডাক্ট ফর্ম */}
      <form onSubmit={handleAddProduct} className="lg:col-span-1 bg-[#121211] border border-[#c9a054]/15 rounded-xl p-6 space-y-4 h-fit">
        <h3 className="text-sm font-bold text-white border-b border-[#c9a054]/10 pb-3">নতুন প্রোডাক্ট যোগ করুন</h3>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">প্রোডাক্টের নাম *</label>
          <input
            type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>

        <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">ক্যাটাগরি *</label>
            <select
              value={form.categorySlug}
              onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
              
              <option value="hero-section">✨ হিরো সেকশন পরিবর্তন</option>
              <option value="featured-collection">✨ ফিচারড কালেকশন ব্যানার</option>
            </select>
          </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">দাম (৳) *</label>
            <input
              type="number" required min={0} value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">পুরাতন দাম</label>
            <input
              type="number" min={0} value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#c9a054]"
              placeholder="ঐচ্ছিক"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">প্রোডাক্ট ছবি *</label>
          <input
            id="product-image-input"
            type="file" accept="image/*" required
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#c9a054] file:text-black file:text-xs file:font-bold"
          />
        </div>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-xs py-3 rounded-xl transition-all"
        >
          {isSubmitting ? "যোগ করা হচ্ছে..." : "প্রোডাক্ট যোগ করুন"}
        </button>
      </form>

      {/* প্রোডাক্ট লিস্ট */}
      <div className="lg:col-span-2 space-y-3">
        {products.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-16">এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 flex items-center gap-4">
            <img src={p.images?.[0]} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-gray-800" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{p.name}</p>
              <p className="text-xs text-gray-500">{categories.find((c) => c.slug === p.category_slug)?.name ?? p.category_slug}</p>
              <p className="text-xs font-black text-[#c9a054]">{formatBDT(p.price)}</p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              disabled={deletingId === p.id}
              className="text-xs text-red-300 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 px-3 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {deletingId === p.id ? "..." : "ডিলিট"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}