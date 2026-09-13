"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"staff" | "master">("staff");

  // স্টাফ লগইন (ইমেইল + পাসওয়ার্ড)
  const [email, setEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  // মাস্টার পাসওয়ার্ড (আগের সিস্টেম, fallback হিসেবে থাকছে)
  const [masterPassword, setMasterPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: authError } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password: staffPassword,
      });
      if (authError) {
        setError("ইমেইল বা পাসওয়ার্ড সঠিক নয়।");
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

  const handleMasterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: masterPassword }),
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
      <div className="w-full max-w-sm bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] space-y-5">
        <div className="text-center space-y-1">
          <span className="text-3xl block">⚜</span>
          <h1 className="font-serif text-lg font-extrabold text-white">অ্যাডমিন প্যানেল লগইন</h1>
          <p className="text-xs text-gray-500">মায়াবী বুটিকস</p>
        </div>

        <div className="flex bg-black/40 rounded-2xl p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("staff");
              setError("");
            }}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
              mode === "staff" ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black" : "text-gray-400"
            }`}
          >
            স্টাফ লগইন
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("master");
              setError("");
            }}
            className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${
              mode === "master" ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black" : "text-gray-400"
            }`}
          >
            মাস্টার পাসওয়ার্ড
          </button>
        </div>

        {mode === "staff" ? (
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">ইমেইল</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                placeholder="staff@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">পাসওয়ার্ড</label>
              <input
                type="password"
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                placeholder="আপনার পাসওয়ার্ড"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 disabled:opacity-60 text-black font-bold text-sm py-3 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7)] transition-all duration-500 ease-out"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMasterLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">মাস্টার পাসওয়ার্ড</label>
              <input
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors duration-300"
                placeholder="আপনার অ্যাডমিন পাসওয়ার্ড দিন"
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 disabled:opacity-60 text-black font-bold text-sm py-3 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7)] transition-all duration-500 ease-out"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
