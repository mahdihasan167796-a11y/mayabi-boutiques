import type { Metadata } from "next";
import { Fraunces, Noto_Serif_Bengali, Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import { CartDrawer } from "@/components/cart-drawer";
import { getCategories } from "@/lib/categories";
import { getSiteSettings } from "@/lib/settings";
import { I18nProvider } from "@/lib/i18n/context";
import { WhatsappButton } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// হেডিং/এডিটোরিয়াল মোমেন্টের জন্য সেরিফ জোড়া — লাতিন টেক্সটে Fraunces, বাংলায় Noto Serif Bengali
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["500", "600", "700"],
  variable: "--font-noto-serif-bengali",
  display: "swap",
});

// বডি/UI টেক্সটের জন্য পরিষ্কার Sans জোড়া — লাতিনে Plus Jakarta Sans, বাংলায় Hind Siliguri
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});
const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mayabi Boutiques | প্রিমিয়াম ফ্যাশন কালেকশন",
  description:
    "মায়াবী বুটিকস — থ্রি-পিস, শাড়ি, বোরকা, পাঞ্জাবিসহ প্রিমিয়াম লাক্সারি পোশাকের এক্সক্লুসিভ কালেকশন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  const settings = await getSiteSettings();

  return (
    <html
      lang="bn"
      className={`${fraunces.variable} ${notoSerifBengali.variable} ${plusJakarta.variable} ${hindSiliguri.variable}`}
    >
      <body className="min-h-screen bg-[#080808] text-[#d1d5db] font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-amber-500/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-[#8a6829]/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c9a054_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        <I18nProvider>
          <CartProvider>
            <WishlistProvider>
              <SiteHeader categories={categories} announcementText={settings.announcementText} />
              <div className="pt-32 sm:pt-40 relative z-10">{children}</div>
              <SiteFooter />
              <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
              <WhatsappButton phoneNumber={settings.whatsappNumber} />
            </WishlistProvider>
          </CartProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
