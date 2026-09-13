"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { formatBDT, engToBdNum } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "প্রক্রিয়াধীন",
  confirmed: "নিশ্চিত হয়েছে",
  shipped: "পাঠানো হয়েছে",
  delivered: "ডেলিভারি হয়েছে",
  cancelled: "বাতিল হয়েছে",
};

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser.auth.getUser();
      if (!data.user) {
        router.push("/account/login");
        return;
      }

      try {
        const res = await fetch("/api/account/orders");
        const result = await res.json();
        if (!result.ok) {
          setError(result.error || "অর্ডার লোড করা যায়নি।");
        } else {
          setOrders(result.orders || []);
          setProfile(result.profile || {});
        }
      } catch {
        setError("নেটওয়ার্ক সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const handleLogout = async () => {
    await supabaseBrowser.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500 text-sm">লোড হচ্ছে...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">👤 আমার অ্যাকাউন্ট</h1>
          <p className="text-xs text-gray-500 mt-1">
            {profile.name} {profile.phone ? `· ${profile.phone}` : ""} {profile.email ? `· ${profile.email}` : ""}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 border border-white/10 px-4 py-2 rounded-full hover:border-red-500/40 hover:text-red-400 transition-all"
        >
          লগআউট
        </button>
      </div>

      <h2 className="font-serif text-lg font-bold text-white mb-4">আমার অর্ডার সমূহ</h2>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-sm text-gray-500 py-10 text-center">এখনো কোনো অর্ডার নেই।</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gradient-to-b from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/10 rounded-2xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-amber-400">#{String(order.id).slice(0, 8).toUpperCase()}</span>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                  {STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
              {order.order_items && order.order_items.length > 0 ? (
                <div className="space-y-1 mb-2">
                  {order.order_items.map((it: any) => (
                    <p key={it.id} className="text-xs text-gray-400">
                      {it.product_name} × {engToBdNum(it.quantity)}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 mb-2">
                  {order.product_name} × {engToBdNum(order.quantity)}
                </p>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{new Date(order.created_at).toLocaleDateString("bn-BD")}</span>
                <span className="font-serif font-bold text-amber-400">{formatBDT(order.total_price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
