import Link from "next/link";
import { categories } from "@/lib/categories";
import { MobileNav } from "@/components/mobile-nav";

export function SiteHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border-b border-[#c9a054]/15 bg-[#070706]/95 backdrop-blur-md">
      <div className="bg-gradient-to-r from-[#8a6829] via-[#c9a054] to-[#8a6829] text-black text-center py-2 text-[10px] sm:text-sm font-bold tracking-wide px-2">
        &ldquo;আভিজাত্য রাঙাক আপনার উৎসব! আমাদের লাক্সারি কালেকশন থেকে সেরাটি বেছে নিন আজই।&rdquo;
      </div>

      <nav className="relative h-16 sm:h-20 flex items-center justify-between max-w-7xl mx-auto px-3 sm:px-4 w-full gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <MobileNav />
          <Link
            href="/"
            className="text-base sm:text-2xl font-black tracking-widest cursor-pointer flex items-center gap-1.5 sm:gap-2 select-none animate-text-shine"
          >
            <span>⚜</span> MAYABI BOUTIQUES
          </Link>
        </div>

        <div className="hidden lg:flex space-x-6 text-xs uppercase tracking-widest font-semibold text-gray-300">
          <Link href="/" className="hover:text-[#c9a054] transition-all">হোম</Link>
          <Link href="/#featured" className="hover:text-[#c9a054] transition-all">ফিচারড কালেকশন</Link>
          <Link href="/#our-story" className="hover:text-[#c9a054] transition-all">আমাদের গল্প</Link>
          <Link href="/#why-us" className="hover:text-[#c9a054] transition-all">কেন আমরা সেরা</Link>
          <Link href="/#reviews" className="hover:text-[#c9a054] transition-all">গ্রাহকদের মন্তব্য</Link>
          <Link href="/#pricing" className="hover:text-[#c9a054] transition-all">কম্বো প্যাকেজ</Link>
          <Link href="/#footer" className="hover:text-[#c9a054] transition-all">যোগাযোগ</Link>
        </div>

        {/* 🔍 প্রফেশনাল সার্চ বার */}
        <div className="relative flex-1 max-w-[160px] sm:max-w-[220px] lg:max-w-[200px]">
          <input
            type="text"
            placeholder="পণ্য খুঁজুন..."
            className="w-full bg-[#141413] text-gray-200 text-[11px] sm:text-xs rounded-full py-1.5 sm:py-2 pl-8 sm:pl-9 pr-3 border border-[#c9a054]/30 focus:border-[#c9a054] focus:outline-none focus:ring-1 focus:ring-[#c9a054] placeholder-gray-500 transition-all"
          />
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a054] absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </nav>

      <div className="bg-[#111110] py-3 border-t border-[#c9a054]/10">
        <div
          className="max-w-7xl mx-auto px-4 flex space-x-3 overflow-x-auto scrollbar-none pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm whitespace-nowrap border transition-all bg-[#181817] text-[#b5af9f] border-[#c9a054]/15 hover:border-[#c9a054]/40 hover:bg-[#c9a054] hover:text-black hover:font-bold shrink-0"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}