"use client";

import React, { useState } from "react";
import { BD_DISTRICTS } from "@/lib/bd-districts";

interface DeliveryZone {
  district_name: string;
  estimated_days: string;
  cod_available: boolean;
}

export function DeliveryChecker({ zones = [] }: { zones?: DeliveryZone[] }) {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [result, setResult] = useState<DeliveryZone | null | "default">(null);

  const handleCheck = () => {
    if (!selectedDistrict) return;
    const match = zones.find((z) => z.district_name === selectedDistrict);
    setResult(match || "default");
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mt-4">
      <p className="text-xs font-bold text-gray-300 mb-2.5 flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="6" width="16" height="12" rx="1" />
          <path d="M17 10h4l2 3v5h-6" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="19" r="2" />
        </svg>
        ডেলিভারি চেক করুন
      </p>
      <div className="flex gap-2">
        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setResult(null);
          }}
          className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="">আপনার জেলা নির্বাচন করুন</option>
          {BD_DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <button
          onClick={handleCheck}
          disabled={!selectedDistrict}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 disabled:opacity-40 text-black text-xs font-bold rounded-xl transition-all"
        >
          চেক করুন
        </button>
      </div>

      {result && (
        <div className="mt-3 text-xs bg-black/30 rounded-xl p-3 space-y-1">
          {result === "default" ? (
            <p className="text-gray-300">
              📦 <span className="font-bold text-white">{selectedDistrict}</span>-এ সাধারণত{" "}
              <span className="text-amber-400 font-bold">৩-৫ কার্যদিবসে</span> ডেলিভারি হয় — ক্যাশ অন ডেলিভারি সুবিধা আছে।
            </p>
          ) : (
            <>
              <p className="text-gray-300">
                📦 <span className="font-bold text-white">{result.district_name}</span>-এ ডেলিভারি সময়:{" "}
                <span className="text-amber-400 font-bold">{result.estimated_days}</span>
              </p>
              <p className={result.cod_available ? "text-green-400" : "text-red-400"}>
                {result.cod_available ? "✓ ক্যাশ অন ডেলিভারি সুবিধা আছে" : "✕ শুধু বিকাশ/নগদে অগ্রিম পেমেন্ট প্রযোজ্য"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
