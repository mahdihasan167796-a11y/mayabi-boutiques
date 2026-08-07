"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setError(result.error || "লগইন ব্যর্থ হয়েছে।");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-[#121211] border border-[#c9a054]/20 rounded-2xl p-8 shadow-2xl space-y-5"
      >
        <div className="text-center space-y-1">
          <span className="text-3xl block">⚜</span>
          <h1 className="text-lg font-extrabold text-white">অ্যাডমিন প্যানেল লগইন</h1>
          <p className="text-xs text-gray-500">মায়াবী বুটিকস</p>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">পাসওয়ার্ড</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-[#070706] border border-[#c9a054]/20 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#c9a054]"
            placeholder="আপনার অ্যাডমিন পাসওয়ার্ড দিন"
          />
        </div>

        {error && <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] disabled:opacity-60 text-black font-bold text-sm py-3 rounded-xl transition-all"
        >
          {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
        </button>
      </form>
    </div>
  );
}
