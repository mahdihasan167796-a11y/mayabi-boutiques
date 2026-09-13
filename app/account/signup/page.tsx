"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।");
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, phone } },
      });

      if (signUpError) {
        setError(
          signUpError.message.toLowerCase().includes("already")
            ? "এই ইমেইলে আগে থেকেই একটা অ্যাকাউন্ট আছে।"
            : signUpError.message
        );
        return;
      }

      if (data.session) {
        // ইমেইল কনফার্মেশন বন্ধ থাকলে সাথে সাথেই লগইন হয়ে যাবে
        router.push("/account");
        router.refresh();
      } else {
        // কনফার্মেশন চালু থাকলে ইমেইল চেক করার বার্তা দেখানো
        setNeedsConfirmation(true);
      }
    } catch {
      setError("নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center space-y-3">
          <span className="text-4xl block">📧</span>
          <h1 className="font-serif text-lg font-bold text-white">ইমেইল কনফার্ম করুন</h1>
          <p className="text-xs text-gray-400">
            আপনার ইমেইলে একটা কনফার্মেশন লিংক পাঠানো হয়েছে — লিংকে ক্লিক করে অ্যাকাউন্ট সক্রিয় করুন।
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] space-y-5">
        <div className="text-center space-y-1">
          <span className="text-3xl block">⚜</span>
          <h1 className="font-serif text-lg font-extrabold text-white">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
          <p className="text-xs text-gray-500">মায়াবী বুটিকস</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">আপনার নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">মোবাইল নাম্বার</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">ইমেইল</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase block mb-1.5">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 disabled:opacity-60 text-black font-bold text-sm py-3 rounded-2xl transition-all duration-500 ease-out"
          >
            {loading ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link href="/account/login" className="text-amber-400 underline">
            লগইন করুন
          </Link>
        </p>
      </div>
    </div>
  );
}
