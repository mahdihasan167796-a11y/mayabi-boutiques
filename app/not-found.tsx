import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <h1 className="font-serif text-6xl font-black bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 bg-clip-text text-transparent mb-5">
        ৪০৪
      </h1>
      <p className="text-lg text-white mb-2">দুঃখিত, আপনি যা খুঁজছেন তা পাওয়া যায়নি।</p>
      <p className="text-sm text-gray-500 mb-9">পেজটি হয়তো সরিয়ে ফেলা হয়েছে বা লিংকটি সঠিক নয়।</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 text-black px-8 py-3.5 rounded-2xl text-sm font-bold shadow-[0_16px_30px_-10px_rgba(245,158,11,0.55)] hover:shadow-[0_20px_38px_-8px_rgba(245,158,11,0.7)] hover:-translate-y-0.5 transition-all duration-500 ease-out"
      >
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}
