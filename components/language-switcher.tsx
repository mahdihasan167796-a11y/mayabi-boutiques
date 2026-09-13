"use client";

import React from "react";
import { useI18n } from "@/lib/i18n/context";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center bg-black/40 border border-white/10 rounded-full p-0.5 ${className}`}>
      <button
        onClick={() => setLocale("bn")}
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
          locale === "bn" ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black" : "text-gray-400"
        }`}
      >
        বাং
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 ${
          locale === "en" ? "bg-gradient-to-r from-amber-400 to-amber-600 text-black" : "text-gray-400"
        }`}
      >
        EN
      </button>
    </div>
  );
}
