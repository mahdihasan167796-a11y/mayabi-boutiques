"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// এডমিনের "প্রোমো/হোম ব্যানার" থেকে placement = 'hero' হিসেবে আসা রো
interface HeroBannerRow {
  id?: string;
  image?: string; // media_type অনুযায়ী এটি ছবি অথবা ভিডিওর URL হতে পারে
  media_type?: "image" | "video";
  title?: string;
  subtitle?: string;
  cta_label?: string;
  cta_link?: string;
}

interface HeroSlide {
  mediaUrl: string;
  mediaType: "image" | "video";
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
}

const DEFAULT_TITLE = "প্রতিটি সুতোয়,\nএকটি রাজকীয় গল্প।";
const DEFAULT_SUBTITLE =
  "মায়াবী বুটিকস-এর হাতে বাছাই কালেকশন — প্রতিটি উৎসব, প্রতিটি মুহূর্তের জন্য বোনা আভিজাত্য।";
const DEFAULT_CTA_LABEL = "Collection ড্রপ দেখুন";
const DEFAULT_CTA_LINK = "#featured";

// অ্যাডমিন এখনো কোনো হিরো ব্যানার যোগ না করলে এই ডিফল্ট ছবিগুলো দেখাবে
const fallbackSlides: HeroSlide[] = [
  {
    mediaUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop",
    mediaType: "image",
    title: DEFAULT_TITLE,
    subtitle: DEFAULT_SUBTITLE,
    ctaLabel: DEFAULT_CTA_LABEL,
    ctaLink: DEFAULT_CTA_LINK,
  },
  {
    mediaUrl: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop",
    mediaType: "image",
    title: "রাজকীয় রেশম কালেকশন",
    subtitle: DEFAULT_SUBTITLE,
    ctaLabel: DEFAULT_CTA_LABEL,
    ctaLink: DEFAULT_CTA_LINK,
  },
  {
    mediaUrl: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1600&auto=format&fit=crop",
    mediaType: "image",
    title: "আভিজাত্যের ব্রাইডাল সম্ভার",
    subtitle: DEFAULT_SUBTITLE,
    ctaLabel: DEFAULT_CTA_LABEL,
    ctaLink: DEFAULT_CTA_LINK,
  },
];

export function HeroBanner({ banners }: { banners?: HeroBannerRow[] }) {
  // এডমিন প্যানেল থেকে placement='hero' ব্যানার থাকলে সেগুলো দেখাবে (ছবি ও ভিডিও মিশিয়েও রাখা যাবে),
  // না থাকলে নিচের ডিফল্ট ফলব্যাক ছবিগুলো ব্যবহার হবে।
  const slideList: HeroSlide[] =
    banners && banners.length > 0
      ? banners
          .filter((b) => !!b.image)
          .map((b) => ({
            mediaUrl: b.image as string,
            mediaType: b.media_type === "video" ? "video" : "image",
            title: b.title || DEFAULT_TITLE,
            subtitle: b.subtitle || DEFAULT_SUBTITLE,
            ctaLabel: b.cta_label || DEFAULT_CTA_LABEL,
            ctaLink: b.cta_link || DEFAULT_CTA_LINK,
          }))
      : fallbackSlides;

  const finalSlides = slideList.length > 0 ? slideList : fallbackSlides;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, [finalSlides.length]);

  useEffect(() => {
    if (finalSlides.length <= 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % finalSlides.length), 5000);
    return () => clearInterval(timer);
  }, [finalSlides.length]);

  const activeSlide = finalSlides[current] || finalSlides[0];

  return (
    <section className="relative -mt-32 sm:-mt-40 pt-32 sm:pt-40 min-h-[580px] sm:min-h-[660px] flex items-center justify-center text-center overflow-hidden">
      {/* ব্যাকগ্রাউন্ড — একাধিক ছবি/ভিডিও ব্যানার পালাক্রমে (ক্রসফেড) দেখাবে */}
      <div className="absolute inset-0 z-0">
        {finalSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
              idx === current ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.mediaType === "video" ? (
              idx === current && (
                <video
                  src={slide.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover grayscale-[35%] contrast-[1.1] brightness-[.6]"
                />
              )
            ) : (
              <img
                src={slide.mediaUrl}
                alt={slide.title}
                className="w-full h-full object-cover grayscale-[45%] contrast-[1.15] brightness-[.55]"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_38%,rgba(8,8,8,0.35),rgba(8,8,8,0.9)_72%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/60 to-[#080808]" />
      </div>

      <div className="relative z-10 max-w-2xl px-6 py-20">
        <div className="flex justify-center mb-7">
          <span className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_40px_-4px_rgba(245,158,11,0.7)]">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="currentColor">
              <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.4l-6.3 4.6L8 13.8 2 9.2h7.6z" />
            </svg>
          </span>
        </div>

        <h1 className="font-serif font-bold text-4xl sm:text-6xl leading-[1.25] text-white mb-6 whitespace-pre-line">
          {activeSlide.title}
        </h1>

        <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-9">
          {activeSlide.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={activeSlide.ctaLink}
            className="inline-flex items-center gap-2.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black font-bold text-sm sm:text-[15px] px-8 py-4 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55),0_0_46px_-6px_rgba(245,158,11,0.65)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7),0_0_64px_-4px_rgba(245,158,11,0.9)] hover:-translate-y-0.5 transition-all duration-500 ease-out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            {activeSlide.ctaLabel}
          </Link>
          <Link
            href="#our-story"
            className="text-gray-200 text-sm sm:text-[15px] pb-1 border-b border-white/20 hover:border-amber-400 hover:text-white transition-colors duration-500 ease-out"
          >
            আমাদের গল্প
          </Link>
        </div>

        {finalSlides.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-10">
            {finalSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`স্লাইড ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === current ? "w-6 bg-amber-500" : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
