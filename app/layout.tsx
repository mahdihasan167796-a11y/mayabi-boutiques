import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Mayabi Boutiques | প্রিমিয়াম ফ্যাশন কালেকশন",
  description:
    "মায়াবী বুটিকস — থ্রি-পিস, শাড়ি, বোরকা, পাঞ্জাবিসহ প্রিমিয়াম লাক্সারি পোশাকের এক্সক্লুসিভ কালেকশন। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#070706] text-[#e0d9c5] font-sans selection:bg-[#c9a054] selection:text-black overflow-x-hidden relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[15%] left-[10%] w-72 h-72 bg-[#c9a054]/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-[50%] right-[5%] w-96 h-96 bg-[#8a6829]/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c9a054_1px,transparent_1px)] [background-size:32px_32px]" />
        </div>

        <SiteHeader />
        <div className="pt-32 sm:pt-40 relative z-10">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
