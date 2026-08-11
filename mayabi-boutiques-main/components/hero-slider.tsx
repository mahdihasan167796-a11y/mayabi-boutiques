"use client";

import React, { useState, useEffect } from "react";

export function HeroSlider({ products }: { products?: any[] }) {
  // 🌟 হিরো সেকশনের অটো-স্লাইডার লজিক
  const heroItems = products?.filter((p: any) => p.category_slug === "hero-section");
  const fallbackImages = [
    {
      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop",
      title: "মেহেফিল-এ-খাস কালেকশন",
    },
    {
      img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop",
      title: "রাজকীয় রেশম কালেকশন",
    },
    {
      img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop",
      title: "আভিজাত্যের ব্রাইডাল সম্ভার",
    },
    {
      img: "https://images.unsplash.com/photo-1583391733975-f20387be3a7f?q=80&w=800&auto=format&fit=crop",
      title: "অনন্যা এক্সক্লুসিভ থ্রি-পিস",
    },
  ];

  // এডমিন প্যানেল থেকে পাওয়া ছবিগুলো প্রসেস করা
  const slideList =
    heroItems && heroItems.length > 0
      ? heroItems.flatMap((item: any) =>
          (item.images && item.images.length > 0 ? item.images : [item.image]).map(
            (imgUrl: string) => ({
              img: imgUrl,
              title: item.name || "মেহেফিল-এ-খাস কালেকশন",
            })
          )
        )
      : fallbackImages;

  const [currentSlide, setCurrentSlide] = useState(0);

  // ৩ সেকেন্ড পর পর অটো স্লাইড হওয়ার টাইমার
  useEffect(() => {
    if (slideList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideList.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slideList.length]);

  return (
    <div className="w-full max-w-sm mx-auto flex justify-center [perspective:1000px]">
      <div className="relative h-[440px] w-full rounded-3xl overflow-hidden border border-[#c9a054]/40 bg-black shadow-2xl transition-all duration-700 [transform-style:preserve-3d] [transform:rotateY(-15deg)_rotateZ(-3deg)] hover:[transform:rotateY(0deg)] group">
        {/* অটো-স্লাইড ইমেজ পার্ট */}
        {slideList.map((slide: any, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={slide.img}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent flex items-end p-6">
              <p className="text-[#c9a054] font-serif italic text-lg">
                {slide.title}
              </p>
            </div>
          </div>
        ))}

        {/* স্লাইডার ডট (ইনডিকেটর) */}
        <div className="absolute top-4 right-4 z-20 flex gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-[#c9a054]/30">
          {slideList.map((_: any, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "w-5 bg-[#c9a054]" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}