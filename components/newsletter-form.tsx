"use client";

import React, { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        setStatus("error");
        setMessage(result.error || "সাবস্ক্রাইব করা যায়নি।");
        return;
      }
      setStatus("done");
      setMessage(result.alreadySubscribed ? "আপনি আগে থেকেই সাবস্ক্রাইবড!" : "ধন্যবাদ! সাবস্ক্রাইব হয়ে গেছে।");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("নেটওয়ার্ক সমস্যা হয়েছে।");
    }
  };

  if (status === "done") {
    return <p className="text-xs text-green-400">✓ {message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="আপনার ইমেইল"
          className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold rounded-lg hover:brightness-110 disabled:opacity-60 transition-all"
        >
          {status === "loading" ? "..." : "সাবস্ক্রাইব"}
        </button>
      </div>
      {status === "error" && <p className="text-[11px] text-red-400">{message}</p>}
    </form>
  );
}
