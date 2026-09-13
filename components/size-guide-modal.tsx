"use client";

import React from "react";

const SIZE_ROWS = [
  { size: "36", bust: "36", waist: "30", hip: "38" },
  { size: "38", bust: "38", waist: "32", hip: "40" },
  { size: "40", bust: "40", waist: "34", hip: "42" },
  { size: "42", bust: "42", waist: "36", hip: "44" },
  { size: "44", bust: "44", waist: "38", hip: "46" },
  { size: "46", bust: "46", waist: "40", hip: "48" },
];

export function SizeGuideModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <div className="relative bg-[#121211] border border-[#c9a054]/30 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#c9a054]/15 sticky top-0 bg-[#121211]">
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wide flex items-center gap-2">
            <span className="text-[#c9a054]">📏</span> সাইজ গাইড (ইঞ্চিতে)
          </h3>
          <button
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-8 h-8 flex items-center justify-center rounded-full border border-[#c9a054]/20 text-gray-400 hover:text-[#c9a054] hover:border-[#c9a054] transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <table className="w-full text-center text-sm border-collapse">
            <thead>
              <tr className="bg-[#070706] text-[#c9a054] text-xs uppercase">
                <th className="p-2.5 rounded-l-lg">সাইজ</th>
                <th className="p-2.5">বুক (Bust)</th>
                <th className="p-2.5">কোমর (Waist)</th>
                <th className="p-2.5 rounded-r-lg">হিপ (Hip)</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_ROWS.map((row) => (
                <tr key={row.size} className="border-b border-gray-800 text-gray-300">
                  <td className="p-2.5 font-bold text-white">{row.size}</td>
                  <td className="p-2.5">{row.bust}″</td>
                  <td className="p-2.5">{row.waist}″</td>
                  <td className="p-2.5">{row.hip}″</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-[#070706] border border-gray-800 rounded-lg p-3.5 space-y-1.5">
            <p className="text-xs font-bold text-gray-300">📐 কীভাবে মাপবেন:</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              বুক: বুকের সবচেয়ে প্রশস্ত জায়গা ঘুরিয়ে মাপুন। কোমর: কোমরের সবচেয়ে সরু জায়গা। হিপ: হিপের
              সবচেয়ে প্রশস্ত জায়গা।
            </p>
          </div>

          <p className="text-[10px] text-gray-600">
            দ্রষ্টব্য: এটি একটি সাধারণ গাইডলাইন — ফেব্রিক ও কাটিং অনুযায়ী সামান্য পার্থক্য হতে পারে।
          </p>
        </div>
      </div>
    </div>
  );
}
