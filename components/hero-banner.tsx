"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface HeroSlide {
  img: string;
  title: string;
}

export function HeroBanner({ products, videoUrl }: { products?: any[]; videoUrl?: string }) {
  // এডমিন প্যানেলের "hero-section" ক্যাটাগরিতে প্রোডাক্ট থাকলে সেগুলোই দেখাবে
  const heroItems = products?.filter((p: any) => p.category_slug === "hero-section");

  const fallbackImages: HeroSlide[] = [
    {
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1600&auto=format&fit=crop",
      title: "মেহেফিল-এ-খাস কালেকশন",
    },
    {
      img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1600&auto=format&fit=crop",
      title: "রাজকীয় রেশম কালেকশন",
    },
    {
      img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1600&auto=format&fit=crop",
      title: "আভিজাত্যের ব্রাইডাল সম্ভার",
    },
  ];

  const slideList: HeroSlide[] =
    heroItems && heroItems.length > 0
      ? heroItems.flatMap((item: any) =>
          (item.images && item.images.length > 0 ? item.images : [item.image]).map((imgUrl: string) => ({
            img: imgUrl,
            title: item.name || "মেহেফিল-এ-খাস কালেকশন",
          }))
        )
      : fallbackImages;

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slideList.length <= 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slideList.length), 5000);
    return () => clearInterval(timer);
  }, [slideList.length]);

  return (
    <section className="relative -mt-32 sm:-mt-40 pt-32 sm:pt-40 min-h-[580px] sm:min-h-[660px] flex items-center justify-center text-center overflow-hidden">
      {/* ব্যাকগ্রাউন্ড — ঘুরতে থাকা সিনেম্যাটিক ছবি + গ্র্যাডিয়েন্ট ওভারলে */}
      <div className="absolute inset-0 z-0">
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover grayscale-[35%] contrast-[1.1] brightness-[.6]"
          />
        ) : (
          slideList.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
                idx === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.img}
                alt={slide.title}
                className="w-full h-full object-cover grayscale-[45%] contrast-[1.15] brightness-[.55]"
              />
            </div>
          ))
        )}
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

        <h1 className="font-serif font-bold text-4xl sm:text-6xl leading-[1.25] text-white mb-6">
          প্রতিটি সুতোয়,
          <br />
          একটি রাজকীয় গল্প।
        </h1>

        <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-9">
          মায়াবী বুটিকস-এর হাতে বাছাই কালেকশন — প্রতিটি উৎসব, প্রতিটি মুহূর্তের জন্য বোনা আভিজাত্য।
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="#featured"
            className="inline-flex items-center gap-2.5 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black font-bold text-sm sm:text-[15px] px-8 py-4 rounded-2xl shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55),0_0_46px_-6px_rgba(245,158,11,0.65)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7),0_0_64px_-4px_rgba(245,158,11,0.9)] hover:-translate-y-0.5 transition-all duration-500 ease-out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
            Collection ড্রপ দেখুন
          </Link>
          <Link
            href="#our-story"
            className="text-gray-200 text-sm sm:text-[15px] pb-1 border-b border-white/20 hover:border-amber-400 hover:text-white transition-colors duration-500 ease-out"
          >
            আমাদের গল্প
          </Link>
        </div>

        {!videoUrl && slideList.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-10">
            {slideList.map((_, idx) => (
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
