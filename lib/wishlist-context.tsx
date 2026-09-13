"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
}

interface WishlistContextValue {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  removeItem: (productId: string) => void;
  count: number;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);
const STORAGE_KEY = "mb_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // নষ্ট ডেটা থাকলে চুপচাপ খালি লিস্ট দিয়ে শুরু
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // স্টোরেজ ব্লকড থাকলেও অ্যাপ ভাঙবে না
    }
  }, [items, hydrated]);

  const isWishlisted = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((i) => i.productId === item.productId)
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item]
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  return (
    <WishlistContext.Provider value={{ items, toggleItem, isWishlisted, removeItem, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist() অবশ্যই <WishlistProvider> এর ভেতরে ব্যবহার করতে হবে");
  return ctx;
}
