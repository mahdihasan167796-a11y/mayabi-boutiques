"use client";

import React, { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "হোম" },
  { href: "/#featured", label: "ফিচারড কালেকশন" },
  { href: "/#our-story", label: "আমাদের গল্প" },
  { href: "/#why-us", label: "কেন আমরা সেরা" },
  { href: "/#reviews", label: "গ্রাহকদের মন্তব্য" },
  { href: "/#pricing", label: "কম্বো প্যাকেজ" },
  { href: "/#footer", label: "যোগাযোগ" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="মেনু খুলুন"
        className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#c9a054]/30 text-[#c9a054]"
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
        <div className="absolute top-full left-0 right-0 bg-[#0b0b0a] border-t border-b border-[#c9a054]/15 shadow-2xl animate-fadeIn">
          <div className="flex flex-col px-4 py-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-semibold text-gray-300 hover:text-[#c9a054] border-b border-white/5 last:border-b-0"
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
