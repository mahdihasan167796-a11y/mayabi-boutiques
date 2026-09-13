"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useI18n, localizedName } from "@/lib/i18n/context";

interface CategoryItem {
  slug: string;
  name: string;
  name_en?: string;
  tag?: string;
  tag_en?: string;
  image?: string;
}

export function CategoryMegaMenu({ categories }: { categories: CategoryItem[] }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const show = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const scheduleHide = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  if (categories.length === 0) return null;

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={scheduleHide}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 hover:text-amber-400 transition-all duration-300"
      >
        <span>{locale === "en" ? "Categories" : "ক্যাটাগরি"}</span>
        <span className={`text-[9px] transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full mt-4 w-[92vw] max-w-3xl origin-top transition-all duration-300 ease-out ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-b from-[#141210] to-[#0c0b0a] border border-white/10 rounded-3xl shadow-[0_40px_70px_-30px_rgba(0,0,0,0.9)] p-6 backdrop-blur-xl">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                onClick={() => setOpen(false)}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black group-hover:border-amber-500/50 transition-all duration-500 ease-out">
                  {cat.image && (
                    <img
                      src={cat.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-200 group-hover:text-amber-400 transition-colors duration-300 normal-case tracking-normal">
                  {localizedName(locale, cat.name, cat.name_en)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
