"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations, type Locale } from "./translations";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const COOKIE_NAME = "mb_locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("bn");

  // পেজ লোড হওয়ার সময় আগে সেভ করা ভাষা (থাকলে) ফিরিয়ে আনা
  useEffect(() => {
    const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=(bn|en)`));
    if (match) setLocaleState(match[1] as Locale);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.cookie = `${COOKIE_NAME}=${newLocale}; path=/; max-age=31536000`;
  }, []);

  const t = useCallback(
    (key: string): string => translations[locale][key] ?? translations.bn[key] ?? key,
    [locale]
  );

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n() অবশ্যই <I18nProvider> এর ভেতরে ব্যবহার করতে হবে");
  return ctx;
}

/** প্রোডাক্ট/ক্যাটাগরির bilingual নাম দেখানোর হেল্পার — ইংরেজি না থাকলে বাংলায় fallback করে */
export function localizedName(locale: Locale, nameBn: string, nameEn?: string | null): string {
  if (locale === "en" && nameEn && nameEn.trim()) return nameEn;
  return nameBn;
}
