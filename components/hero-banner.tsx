"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  cta_label?: string;
  cta_link?: string;
  media_type?: "image" | "video";
}

export default function HeroBanner({ banners }: { banners: BannerItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const active = banners[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-black overflow-hidden group">
      {active.media_type === "video" ? (
        <video
          src={active.image}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src={active.image}
          alt={active.title || "Banner"}
          fill
          priority
          className="object-cover transition-all duration-700 ease-in-out"
        />
      )}

      {/* টেক্সট ওভারলে - শুধুমাত্র নিচে সূক্ষ্ম গ্র্যাডিয়েন্ট যাতে ছবি ঢেকে না যায় */}
      {(active.title || active.cta_label) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
          {active.title && (
            <h1 className="text-2xl md:text-5xl font-bold mb-2 drop-shadow-md">
              {active.title}
            </h1>
          )}
          {active.subtitle && (
            <p className="text-sm md:text-xl text-gray-200 mb-4 drop-shadow">
              {active.subtitle}
            </p>
          )}
          {active.cta_label && active.cta_link && (
            <div>
              <Link
                href={active.cta_link}
                className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-2.5 rounded-md transition-all shadow-lg text-sm md:text-base"
              >
                {active.cta_label}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* নেভিগেশন ডট */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all ${
                currentIndex === idx ? "w-8 bg-amber-500" : "w-2.5 bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
