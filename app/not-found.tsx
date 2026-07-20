import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <h1 className="text-5xl font-black text-[#c9a054] mb-4">৪০৪</h1>
      <p className="text-lg text-white mb-2">দুঃখিত, আপনি যা খুঁজছেন তা পাওয়া যায়নি।</p>
      <p className="text-sm text-gray-500 mb-8">পেজটি হয়তো সরিয়ে ফেলা হয়েছে বা লিংকটি সঠিক নয়।</p>
      <Link
        href="/"
        className="inline-block bg-gradient-to-r from-[#c9a054] to-[#967233] text-black px-8 py-3 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-all"
      >
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}
