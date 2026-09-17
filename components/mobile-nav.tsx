"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useI18n, localizedName } from "@/lib/i18n/context";

interface CategoryItem {
  slug: string;
  name: string;
  name_en?: string;
  image?: string;
  group?: string | null;
}

// মেন/উইমেন/কিডস — প্রতিটার নিজস্ব খুলা-বন্ধ করার গ্রুপ সেকশন
function GroupSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: CategoryItem[];
  onNavigate: () => void;
}) {
  const { locale } = useI18n();
  const [show, setShow] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setShow((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-sm font-semibold text-gray-300 hover:text-amber-400 transition-colors"
      >
        <span>{title}</span>
        <span className={`text-[10px] transition-transform duration-300 ${show ? "rotate-180" : ""}`}>▼</span>
      </button>
      {show && (
        <div className="grid grid-cols-3 gap-3 pb-4">
          {items.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              onClick={onNavigate}
              className="flex flex-col items-center gap-1.5 text-center"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-white/10 bg-black">
                {cat.image && <img src={cat.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <span className="text-[10px] font-medium text-gray-300">{localizedName(locale, cat.name, cat.name_en)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileNav({ categories = [] }: { categories?: CategoryItem[] }) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const menCategories = categories.filter((c) => c.group === "men");
  const womenCategories = categories.filter((c) => c.group === "women");
  const kidsCategories = categories.filter((c) => c.group === "kids");

  const LINKS = [
    { href: "/", label: t("nav_home") },
    { href: "/#featured", label: t("nav_featured") },
    { href: "/#pricing", label: t("nav_combo") },
    { href: "/lookbook", label: locale === "en" ? "Lookbook" : "লুকবুক" },
    { href: "/sale", label: locale === "en" ? "Sale" : "সেল" },
    { href: "/#contact", label: t("nav_contact") },
  ];

  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="মেনু খুলুন"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-amber-500/30 text-amber-400"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 max-h-[75vh] overflow-y-auto bg-[#0a0a0a] border-t border-b border-amber-500/15 shadow-2xl animate-fadeIn">
          <div className="flex flex-col px-4 py-3">
            <GroupSection title={locale === "en" ? "Men" : "মেন"} items={menCategories} onNavigate={close} />
            <GroupSection title={locale === "en" ? "Women" : "উইমেন"} items={womenCategories} onNavigate={close} />
            <GroupSection title={locale === "en" ? "Kids" : "কিডস"} items={kidsCategories} onNavigate={close} />

            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="py-3 text-sm font-semibold text-gray-300 hover:text-amber-400 border-b border-white/5 last:border-b-0 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
