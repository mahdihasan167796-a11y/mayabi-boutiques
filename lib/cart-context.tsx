"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  categorySlug?: string;
  image: string;
  color?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  maxStock?: number; // অতিরিক্ত স্টকের বেশি অ্যাড হওয়া ঠেকাতে
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "mb_cart_v1";

/**
 * একই প্রোডাক্ট ভিন্ন কালার/সাইজে নিলে কার্টে আলাদা আলাদা লাইন হিসেবে থাকবে —
 * তাই কী (key) বানানো হচ্ছে productId + color + size দিয়ে।
 */
export function itemKey(item: Pick<CartItem, "productId" | "color" | "size">): string {
  return `${item.productId}__${item.color ?? ""}__${item.size ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // পেজ লোড হওয়ার সময় আগের কার্ট (যদি থাকে) localStorage থেকে ফিরিয়ে আনা
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // পুরনো ডেটা নষ্ট থাকলে চুপচাপ খালি কার্ট দিয়ে শুরু করা, এরর দেখানো হবে না
    }
    setHydrated(true);
  }, []);

  // hydration শেষ হওয়ার পর থেকে কার্ট বদলালেই localStorage-এ সেভ হবে
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // স্টোরেজ ফুল বা ব্লকড থাকলেও অ্যাপ ভাঙবে না
    }
  }, [items, hydrated]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const key = itemKey(newItem);
      const existingIndex = prev.findIndex((i) => itemKey(i) === key);

      if (existingIndex > -1) {
        const updated = [...prev];
        const nextQty = updated[existingIndex].quantity + newItem.quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newItem.maxStock ? Math.min(nextQty, newItem.maxStock) : nextQty,
        };
        return updated;
      }
      return [...prev, newItem];
    });
    setIsOpen(true); // কার্টে যোগ করার সাথে সাথেই ড্রয়ার খুলে যাবে
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((i) => (itemKey(i) === key ? { ...i, quantity: Math.max(0, quantity) } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart() অবশ্যই <CartProvider> এর ভেতরে ব্যবহার করতে হবে");
  return ctx;
}
