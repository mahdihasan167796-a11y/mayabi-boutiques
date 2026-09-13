"use client";

import React, { useState } from "react";

const FAQS = [
  {
    q: "কীভাবে অর্ডার করব?",
    a: "পছন্দের প্রোডাক্টে গিয়ে সাইজ/কালার বেছে \"কার্টে যোগ করুন\" বা \"এখনই কিনুন\"-এ ক্লিক করুন। এরপর চেকআউট পেজে আপনার নাম, ঠিকানা ও ফোন নাম্বার দিয়ে অর্ডার নিশ্চিত করুন।",
  },
  {
    q: "কোন কোন পেমেন্ট মেথড সাপোর্ট করে?",
    a: "ক্যাশ অন ডেলিভারি (COD), বিকাশ এবং নগদ — তিনটাই সাপোর্ট করে। বিকাশ/নগদে পেমেন্ট করলে ট্রানজেকশন আইডি দিতে হবে।",
  },
  {
    q: "ডেলিভারি করতে কত সময় লাগে?",
    a: "সাধারণত ঢাকার ভেতরে ২-৩ কার্যদিবস এবং ঢাকার বাইরে ৩-৫ কার্যদিবস সময় লাগে। কুরিয়ার পার্টনারের উপর নির্ভর করে সময় সামান্য কমবেশি হতে পারে।",
  },
  {
    q: "পণ্য পছন্দ না হলে কি ফেরত/এক্সচেঞ্জ করা যাবে?",
    a: "হ্যাঁ, পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে সহজ এক্সচেঞ্জ সুবিধা আছে — পণ্যটি অব্যবহৃত ও মূল ট্যাগসহ থাকতে হবে। বিস্তারিত জানতে আমাদের রিফান্ড/রিটার্ন পলিসি দেখুন।",
  },
  {
    q: "অর্ডার করার পর কীভাবে বুঝব অর্ডার কনফার্ম হয়েছে?",
    a: "অর্ডার সম্পন্ন হলে সাথে সাথে আপনার মোবাইলে একটি নিশ্চিতকরণ SMS যাবে, আর ইমেইল দিয়ে থাকলে একটি কনফার্মেশন ইমেইলও পাবেন।",
  },
  {
    q: "কুপন কোড কীভাবে ব্যবহার করব?",
    a: "চেকআউট পেজের \"কুপন কোড\" ঘরে কোডটি লিখে \"প্রয়োগ করুন\" বাটনে ক্লিক করুন — ছাড়টি সাথে সাথে মোট মূল্য থেকে কমে যাবে।",
  },
  {
    q: "সাইজ বুঝতে সমস্যা হলে কী করব?",
    a: "প্রতিটি প্রোডাক্ট পেজে \"Size Chart\" বাটনে ক্লিক করে বিস্তারিত মাপ দেখতে পারবেন। এরপরও সমস্যা হলে আমাদের সাথে সরাসরি যোগাযোগ করুন।",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Support</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">প্রায়শই জিজ্ঞাসিত প্রশ্ন (FAQ)</h1>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between text-left px-5 py-4 text-sm font-bold text-white hover:text-amber-400 transition-colors duration-300"
            >
              <span>{item.q}</span>
              <span className={`text-amber-400 transition-transform duration-300 ${openIndex === idx ? "rotate-180" : ""}`}>▼</span>
            </button>
            {openIndex === idx && (
              <div className="px-5 pb-4 text-sm text-gray-400 leading-relaxed">{item.a}</div>
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-500">
        আরও প্রশ্ন থাকলে যোগাযোগ করুন —{" "}
        <a href="mailto:support@mayabiboutiques.com" className="text-amber-400 underline">
          support@mayabiboutiques.com
        </a>
      </p>
    </div>
  );
}
