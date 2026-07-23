"use client";

import React, { useState } from "react";

// Types Placeholder (Your predefined types/interfaces)
interface SiteSettings {
  [key: string]: any;
}

interface ProductRow {
  id: string;
  name: string;
  category_slug: string;
  price: number;
  old_price?: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
}

// Dummy Categories list for demo purposes
const categories = [
  { name: "থ্রি-পিস", slug: "three-piece" },
  { name: "শাড়ি", slug: "saree" },
];

const formatBDT = (amount: number) => `৳ ${amount.toLocaleString("bn-BD")}`;

export function SettingsTab({ initialSettings }: { initialSettings: SiteSettings }) {
  const [form, setForm] = useState({
    ...initialSettings,
    isOfferActive: (initialSettings as any).isOfferActive ?? true,
    noOfferMessage:
      (initialSettings as any).noOfferMessage ||
      "বর্তমানে কোনো বিশেষ অফার চালু নেই। নতুন অফারের জন্য আমাদের সাথেই থাকুন!",
    combo1Title: (initialSettings as any).combo1Title || "মেহেফিল কম্বো",
    combo1Price: (initialSettings as any).combo1Price || "৪৫০০",
    combo1OldPrice: (initialSettings as any).combo1OldPrice || "৬০০০",
    combo1Features:
      (initialSettings as any).combo1Features ||
      "১টি কাস্টম ফিটেড থ্রি-পিস\n১টি প্রিমিয়াম ওরনা\nফ্রি হোম ডেলিভারি",
    combo2Title: (initialSettings as any).combo2Title || "ব্রাইডাল মেগা সেট",
    combo2Price: (initialSettings as any).combo2Price || "৬৮০০",
    combo2OldPrice: (initialSettings as any).combo2OldPrice || "৯৫০০",
    combo2Features:
      (initialSettings as any).combo2Features ||
      "২টি প্রিমিয়াম ড্রেস সেট\n১টি এক্সক্লুসিভ স্কার্ফ\nভিআইপি গিফট বক্স\nফ্রি হোম ডেলিভারি",
    facebookUrl: (initialSettings as any).facebookUrl || "",
    instagramUrl: (initialSettings as any).instagramUrl || "",
    tiktokUrl: (initialSettings as any).tiktokUrl || "",
    messengerUrl: (initialSettings as any).messengerUrl || "",
    phoneNumber: (initialSettings as any).phoneNumber || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <form
      onSubmit={handleSave}
      className="max-w-xl bg-[#121211] border border-[#c9a054]/15 rounded-xl p-5 space-y-5"
    >
      <div className="bg-[#181817] border border-[#c9a054]/30 rounded-xl p-4 space-y-4">
        <h3 className="text-xs font-bold text-[#c9a054] flex items-center justify-between border-b border-[#c9a054]/10 pb-2">
          🎁 কম্বো অফার কন্ট্রোল
        </h3>

        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300">
            অফার স্ট্যাটাস (On/Off):
          </label>
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, isOfferActive: !form.isOfferActive })
            }
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              form.isOfferActive
                ? "bg-green-600 text-white"
                : "bg-red-600 text-white"
            }`}
          >
            {form.isOfferActive
              ? "অফার চালু আছে (Active)"
              : "অফার বন্ধ আছে (Inactive)"}
          </button>
        </div>

        {form.isOfferActive ? (
          <div className="space-y-4 pt-2 border-t border-[#c9a054]/10">
            <div className="space-y-3 bg-[#0d0d0c] p-3 rounded-lg border border-[#c9a054]/20">
              <h4 className="text-xs font-bold text-[#c9a054]">
                📦 প্রথম কম্বো প্যাকেজ
              </h4>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  শিরোনাম
                </label>
                <input
                  type="text"
                  value={form.combo1Title}
                  onChange={handleChange("combo1Title")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    অফার মূল্য (৳)
                  </label>
                  <input
                    type="text"
                    value={form.combo1Price}
                    onChange={handleChange("combo1Price")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    আগের মূল্য (৳)
                  </label>
                  <input
                    type="text"
                    value={form.combo1OldPrice}
                    onChange={handleChange("combo1OldPrice")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  ফিচারসমূহ (প্রতি লাইনে একটি)
                </label>
                <textarea
                  rows={3}
                  value={form.combo1Features}
                  onChange={handleChange("combo1Features")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                />
              </div>
            </div>

            <div className="space-y-3 bg-[#0d0d0c] p-3 rounded-lg border border-[#c9a054]/20">
              <h4 className="text-xs font-bold text-[#c9a054]">
                📦 দ্বিতীয় কম্বো প্যাকেজ
              </h4>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  শিরোনাম
                </label>
                <input
                  type="text"
                  value={form.combo2Title}
                  onChange={handleChange("combo2Title")}
                  className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    অফার মূল্য (৳)
                  </label>
                  <input
                    type="text"
                    value={form.combo2Price}
                    onChange={handleChange("combo2Price")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">
                    আগের মূল্য (৳)
                  </label>
                  <input
                    type="text"
                    value={form.combo2OldPrice}
                    onChange={handleChange("combo2OldPrice")}
                    className="w-full bg-[#181817] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1">
                  ফিচারসমূহ (প্রতি লাইনে একটি)
                </label>
                <textarea
                  rows={3}
                  value={form.combo2Features}
                  onChange={handleChange("combo2Features")}
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

      <div>
        <h3 className="text-xs font-bold text-white border-b border-[#c9a054]/10 pb-2 mb-3">
          ফুটার সোশ্যাল লিংক ও যোগাযোগ নাম্বার
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              Facebook পেজ লিংক
            </label>
            <input
              type="url"
              value={form.facebookUrl}
              onChange={handleChange("facebookUrl")}
              placeholder="https://facebook.com/yourpage"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              Instagram প্রোফাইল লিংক
            </label>
            <input
              type="url"
              value={form.instagramUrl}
              onChange={handleChange("instagramUrl")}
              placeholder="https://instagram.com/yourprofile"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              TikTok প্রোফাইল লিংক
            </label>
            <input
              type="url"
              value={form.tiktokUrl}
              onChange={handleChange("tiktokUrl")}
              placeholder="https://tiktok.com/@yourprofile"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              Messenger লিংক
            </label>
            <input
              type="url"
              value={form.messengerUrl}
              onChange={handleChange("messengerUrl")}
              placeholder="https://m.me/yourpage"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              যোগাযোগের ফোন নাম্বার
            </label>
            <input
              type="text"
              value={form.phoneNumber}
              onChange={handleChange("phoneNumber")}
              placeholder="০১৭০০-০০০০০০"
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
        </div>
      </div>

      {message && (
        <p className="text-xs text-green-400 bg-green-950/30 border border-green-900 rounded-lg px-3 py-1.5">
          {message}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-1.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
      >
        {isSaving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
      </button>
    </form>
  );
}

export function ProductsTab({
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
    sizes: "",
    colors: "",
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

      // Sizes and Colors handling (comma-separated string to Array)
      if (form.sizes.trim()) {
        const sizesArray = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);
        fd.append("sizes", JSON.stringify(sizesArray));
      }
      if (form.colors.trim()) {
        const colorsArray = form.colors.split(",").map((c) => c.trim()).filter(Boolean);
        fd.append("colors", JSON.stringify(colorsArray));
      }

      fd.append("image", imageFile);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: fd,
      });
      const result = await res.json();

      if (!res.ok || !result.ok) {
        setError(result.error || "প্রোডাক্ট যোগ করা যায়নি।");
        return;
      }

      setProducts((prev) => [result.product, ...prev]);
      setForm({
        name: "",
        categorySlug: categories[0]?.slug || "",
        price: "",
        oldPrice: "",
        sizes: "",
        colors: "",
      });
      setImageFile(null);
      const fileInput = document.getElementById(
        "product-image-input"
      ) as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
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
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
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
      <form
        onSubmit={handleAddProduct}
        className="lg:col-span-1 bg-[#121211] border border-[#c9a054]/15 rounded-xl p-4 space-y-3 h-fit"
      >
        <h3 className="text-xs font-bold text-white border-b border-[#c9a054]/10 pb-2">
          নতুন প্রোডাক্ট যোগ করুন
        </h3>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
            প্রোডাক্টের নাম *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
            ক্যাটাগরি *
          </label>
          <select
            value={form.categorySlug}
            onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
            <option value="hero-section">✨ হিরো সেকশন পরিবর্তন</option>
            <option value="featured-collection">
              ✨ ফিচারড কালেকশন ব্যানার
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              দাম (৳) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              পুরাতন দাম
            </label>
            <input
              type="number"
              min={0}
              value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
              placeholder="ঐচ্ছিক"
            />
          </div>
        </div>

        {/* সাইজ এবং কালার ইনপুট ফিল্ড সমূহ */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              সাইজ (Sizes)
            </label>
            <input
              type="text"
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
              placeholder="M, L, XL, XXL"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
              কালার (Colors)
            </label>
            <input
              type="text"
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-[#c9a054]"
              placeholder="Red, Blue, Black"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase block mb-1">
            প্রোডাক্ট ছবি *
          </label>
          <input
            id="product-image-input"
            type="file"
            accept="image/*"
            required
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#c9a054] file:text-black file:text-xs file:font-bold"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-2.5 py-1.5">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
        >
          {isSubmitting ? "যোগ করা হচ্ছে..." : "প্রোডাক্ট যোগ করুন"}
        </button>
      </form>

      <div className="lg:col-span-2 space-y-2.5">
        {products.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-16">
            এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
          </p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-[#121211] border border-[#c9a054]/15 rounded-xl p-3 flex items-center gap-3"
          >
            <img
              src={p.images?.[0]}
              alt={p.name}
              className="w-14 h-14 rounded-lg object-cover border border-gray-800"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-white truncate">
                {p.name}
              </p>
              <p className="text-[11px] text-gray-500">
                {categories.find((c) => c.slug === p.category_slug)?.name ??
                  p.category_slug}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-black text-[#c9a054]">
                  {formatBDT(p.price)}
                </span>
                {p.sizes && p.sizes.length > 0 && (
                  <span className="text-[10px] text-gray-400 bg-[#181817] px-1.5 py-0.5 rounded border border-gray-800">
                    Sizes: {p.sizes.join(", ")}
                  </span>
                )}
                {p.colors && p.colors.length > 0 && (
                  <span className="text-[10px] text-gray-400 bg-[#181817] px-1.5 py-0.5 rounded border border-gray-800">
                    Colors: {p.colors.join(", ")}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              disabled={deletingId === p.id}
              className="text-xs text-red-300 hover:text-red-400 bg-red-900/20 hover:bg-red-900/40 border border-red-900/30 px-2.5 py-1.5 rounded-lg font-bold transition-all disabled:opacity-50"
            >
              {deletingId === p.id ? "..." : "ডিলিট"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}