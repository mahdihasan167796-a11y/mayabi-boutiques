import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Headphones } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-neutral-900 text-gray-300 border-t border-neutral-800">
      {/* সার্ভিস হাইলাইটস */}
      <div className="border-b border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-8 h-8 text-amber-500" />
            <h4 className="font-semibold text-white">দ্রুত ডেলিভারি</h4>
            <p className="text-xs text-gray-400">সারা বাংলাদেশে হোম ডেলিভারি</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-amber-500" />
            <h4 className="font-semibold text-white">১০০% প্রিমিয়াম কোয়ালিটি</h4>
            <p className="text-xs text-gray-400">সেরা ফেব্রিক ও ইউনিক ডিজাইন</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <RotateCcw className="w-8 h-8 text-amber-500" />
            <h4 className="font-semibold text-white">সহজ রিটার্ন পলিসি</h4>
            <p className="text-xs text-gray-400">সমস্যা হলে পরিবর্তনের সুযোগ</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Headphones className="w-8 h-8 text-amber-500" />
            <h4 className="font-semibold text-white">২৪/৭ কাস্টমার সাপোর্ট</h4>
            <p className="text-xs text-gray-400">যেেকোনো প্রয়োজনে কল করুন</p>
          </div>
        </div>
      </div>

      {/* মূল ইনফরমেশন ফুটার বক্স */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-2xl font-bold text-amber-500 mb-4">মায়াবী বুটিকস</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            অভিজাত ও আধুনিক পোশাকের বিশ্বস্ত স্থান। আমরা আপনার সৌন্দর্য ও ব্যক্তিত্বকে ফুটিয়ে তুলতে প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4 border-b border-amber-500/30 pb-2 inline-block">
            কুইক লিঙ্কস
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products?category=women" className="hover:text-amber-500 transition">উইমেন কালেকশন</Link></li>
            <li><Link href="/products?category=men" className="hover:text-amber-500 transition">মেন কালেকশন</Link></li>
            <li><Link href="/products?category=kids" className="hover:text-amber-500 transition">কিডস কালেকশন</Link></li>
            <li><Link href="/products" className="hover:text-amber-500 transition">সকল প্রোডাক্টস</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4 border-b border-amber-500/30 pb-2 inline-block">
            গ্রাহক সেবা
          </h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/cart/track" className="hover:text-amber-500 transition">অর্ডার ট্র্যাকিং</Link></li>
            <li><Link href="/terms" className="hover:text-amber-500 transition">টার্মস ও কন্ডিশনস</Link></li>
            <li><Link href="/privacy" className="hover:text-amber-500 transition">প্রাইভেসি পলিসি</Link></li>
            <li><Link href="/return-policy" className="hover:text-amber-500 transition">রিটার্ন ও রিফান্ড</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4 border-b border-amber-500/30 pb-2 inline-block">
            যোগাযোগের ঠিকানা
          </h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3"><MapPin className="w-5 h-5 text-amber-500 shrink-0" /> <span>ঢাকা, বাংলাদেশ</span></li>
            <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-amber-500 shrink-0" /> <span>+880 1700-000000</span></li>
            <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-amber-500 shrink-0" /> <span>support@mayabiboutiques.com</span></li>
          </ul>
        </div>
      </div>

      <div className="bg-black/50 py-4 text-center text-xs text-gray-500 border-t border-neutral-800">
        © {new Date().getFullYear()} Mayabi Boutiques. All rights reserved.
      </div>
    </footer>
  );
}
