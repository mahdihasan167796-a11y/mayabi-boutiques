import Link from "next/link";
import { categories, featuredCategorySlugs } from "@/lib/categories";

export default function HomePage() {
  const products: any[] = [];
  const featured = featuredCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as typeof categories;

  const reviews = [
    { name: "ফারজানা রহমান", location: "ঢাকা", text: "পোশাকের ফেব্রিকটা অসাধারণ ছিলো। রেশমি সুতোর কাজটা খুব নিখুঁত, ঠিক যেমনটা ছবিতে দেখেছি। লাক্সারি প্যাকিংটাও খুব সুন্দর।" },
    { name: "তানভীর আহমেদ", location: "সিলেট", text: "পাঞ্জাবির ফিটিং এবং কাপড়ের কোয়ালিটি দারুণ হয়েছে। ডার্ক গোল্ড প্রিমিয়াম সিগনেচার বক্স প্যাকেজিংটা ভীষণ গর্জিয়াস লেগেছে।" },
    { name: "নুসরাত জাহান", location: "চট্টগ্রাম", text: "খুব দ্রুত ডেলিভারি পেয়েছি। কাপড়ের প্রিমিয়াম কোয়ালিটি নিয়ে কোনো কমপ্লেন নেই, মায়াবী বুটিকস সত্যি অনন্য ও রাজকীয়।" },
  ];

  const whyUs = [
    { icon: "✨", title: "১০০% প্রিমিয়াম ফেব্রিক", desc: "আমরা সরাসরি বিশ্বস্ত সোর্স থেকে সবচেয়ে আরামদায়ক লাক্সারি সুতা ও ফেব্রিক সংগ্রহ করি।" },
    { icon: "🎨", title: "ইউনিক রাজকীয় ডিজাইন", desc: "আমাদের কারিগরদের তৈরি প্রতিটি ডিজাইন স্বতন্ত্র ও সীমিত সংস্করণের।" },
    { icon: "🤝", title: "সহজ রিটার্ন ও ক্যাশ অন ডেলিভারি", desc: "সারা বাংলাদেশে ঘরে বসে পণ্য দেখে মূল্য পরিশোধ ও ৭ দিনের ইজি এক্সচেঞ্জ সুবিধা।" },
  ];

  return (
    <>
      {/* হিরো সেকশন */}
      <section id="home" className="max-w-7xl mx-auto px-4 py-16 grid lg:grid-cols-2 gap-12 items-center min-h-[70vh] scroll-mt-32">
        <div className="space-y-6 text-center lg:text-left">
          <span className="text-[#c9a054] font-bold tracking-widest text-xs border border-[#c9a054]/40 px-4 py-1.5 rounded-full bg-[#c9a054]/5">
            PREMIUM CLOTHING 2026
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            <span className="bg-gradient-to-r from-[#f3e7c4] via-[#c9a054] to-[#f3e7c4] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(201,160,84,0.2)]">
              পোশাকে মায়াবী ছোঁয়া
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#b5af9f] max-w-lg mx-auto lg:mx-0 leading-relaxed">
            মায়াবী বুটিকসে আপনাকে স্বাগত। আমাদের নিজস্ব দক্ষ কারিগর দ্বারা তৈরি এক্সক্লুসিভ ডিজাইনের প্রিমিয়াম পোশাকের এক রাজকীয় সমাহার।
          </p>
          <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4">
            <Link
              href="#featured"
              className="bg-gradient-to-r from-[#c9a054] to-[#967233] text-black font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all"
            >
              কালেকশন দেখুন
            </Link>
            <Link
              href="#featured"
              className="bg-gradient-to-r from-[#7a121d] to-[#4a070f] border-2 border-[#c9a054] text-[#ffd700] font-black text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 text-center flex items-center justify-center"
            >
              এখনি অর্ডার করুন
            </Link>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto flex justify-center [perspective:1000px]">
          <div className="relative h-[440px] w-full rounded-3xl overflow-hidden border border-[#c9a054]/40 bg-black shadow-2xl transition-all duration-700 [transform-style:preserve-3d] [transform:rotateY(-15deg)_rotateZ(-3deg)] hover:[transform:rotateY(0deg)] group">
            <img
              src={products?.find((p: any) => p.category_slug === 'hero-section')?.images?.[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"}
              alt="Hero 3D"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent flex items-end p-6">
              <p className="text-[#c9a054] font-serif italic text-lg">
                {products?.find((p: any) => p.category_slug === 'hero-section')?.name || "মেহেফিল-এ-খাস কালেকশন"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ফিচারড কালেকশন */}
      <section id="featured" className="bg-[#0b0b0a] border-t border-[#c9a054]/10 py-16 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-2">TRENDING CATEGORIES</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">আমাদের আকর্ষণীয় প্রিমিয়াম ক্যাটাগরি</h2>
          </div>

          {products?.find((p: any) => p.category_slug === 'featured-collection') && (
            <div className="w-full mb-10 rounded-2xl overflow-hidden border border-[#c9a054]/20 shadow-2xl">
              <img 
                src={products.find((p: any) => p.category_slug === 'featured-collection')?.images?.[0]} 
                alt="Featured Banner" 
                className="w-full h-auto max-h-[300px] object-cover" 
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featured.filter((col: any) => col.slug !== 'hero-section' && col.slug !== 'featured-collection').map((col: any) => (
              <Link
                key={col.slug}
                href={`/category/${col.slug}`}
                className="bg-[#121211] rounded-2xl overflow-hidden border border-[#c9a054]/15 p-3 flex flex-col justify-between group cursor-pointer shadow-xl transition-all duration-500 hover:border-[#c9a054]/50 hover:-translate-y-2"
              >
                <div className="h-44 sm:h-56 w-full overflow-hidden rounded-xl bg-black relative mb-4">
                  <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute top-2 left-2 bg-[#c9a054] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {col.tag}
                  </span>
                </div>
                <div className="text-center pb-2">
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#c9a054]">{col.name}</h3>
                  <p className="text-[10px] text-gray-500 mt-1">এখনি অর্ডার করতে ক্লিক করুন →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* আমাদের গল্প */}
      <section id="our-story" className="bg-[#070706] border-t border-[#c9a054]/10 py-16 scroll-mt-32">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block">OUR STORY</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">আমাদের গল্প</h2>
          <div className="w-12 h-0.5 bg-[#c9a054] mx-auto my-2" />
          <div className="text-sm sm:text-base text-[#b5af9f] leading-relaxed max-w-3xl mx-auto font-medium space-y-2">
            <p>সুতা আর কাপড়ের বন্ধনে আভিজাত্য ফুটিয়ে তোলার এক জাদুকরী স্বপ্ন নিয়ে শুরু হয়েছিল মায়াবী বুটিকস-এর পথচলা।</p>
            <p>আমরা কেবল পোশাক বিক্রি করি না, বরং আমাদের দক্ষ কারিগরদের নিখুঁত হাতের ছোঁয়ায় প্রতিটি সুতোয় বুনে চলি এক একটি রাজকীয় গল্প।</p>
            <p>২০২৬ সালের এই আধুনিক ফ্যাশন ট্রেন্ডে খাঁটি ঐতিহ্য আর প্রিমিয়াম লাক্সারি ফেব্রিকের মেলবন্ধনে আমরা তৈরি করছি সম্পূর্ণ ইউনিক সব ডিজাইন।</p>
            <p>আপনার জীবনের প্রতিটি বিশেষ মুহূর্তকে আরও আকর্ষণীয় ও মায়াবী করে তোলাই আমাদের মূল অনুপ্রেরণা ও একমাত্র লক্ষ্য।</p>
          </div>
        </div>
      </section>

      {/* কেন আমরা সেরা */}
      <section id="why-us" className="bg-[#0b0b0a] border-y border-[#c9a054]/10 py-20 scroll-mt-32">
        <div className="max-w-6xl mx-auto px-4 text-center mb-12">
          <h2 className="text-xl sm:text-3xl font-bold text-white">কেন মায়াবী বুটিকস আপনার প্রথম পছন্দ?</h2>
          <div className="w-16 h-0.5 bg-[#c9a054] mx-auto mt-2" />
        </div>
        <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-3 gap-8">
          {whyUs.map((feat) => (
            <div
              key={feat.title}
              className="bg-[#121211] p-6 rounded-2xl border border-gray-800 text-center space-y-3 transition-all duration-300 hover:scale-105 hover:-translate-y-3 hover:border-[#c9a054] group"
            >
              <span className="text-3xl block">{feat.icon}</span>
              <h3 className="font-bold text-white text-base group-hover:text-[#c9a054]">{feat.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* গ্রাহকদের রিভিউ */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 py-24 scroll-mt-32">
        <div className="text-center mb-14">
          <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-2">HAPPY CUSTOMERS</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">আমাদের ধন্য গ্রাহকদের মন্তব্য</h2>
          <div className="w-16 h-0.5 bg-[#c9a054] mx-auto mt-3" />
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.name}
              className="bg-[#111110] p-8 rounded-2xl border border-[#c9a054]/15 relative shadow-xl transition-all duration-300 hover:border-[#c9a054]/50 hover:-translate-y-2 flex flex-col justify-between group"
            >
              <span className="absolute top-4 right-6 text-6xl text-[#c9a054]/5 font-serif select-none">&ldquo;</span>
              <div className="space-y-4">
                <div className="flex text-[#c9a054] text-sm tracking-wide">★★★★★</div>
                <p className="text-xs sm:text-sm italic text-[#b5af9f] leading-relaxed">&ldquo;{rev.text}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#c9a054]/10">
                <div className="w-10 h-10 rounded-full bg-[#1c1c1a] border border-[#c9a054]/40 flex items-center justify-center text-sm font-bold text-[#c9a054]">
                  {rev.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                    {rev.name}
                    <span className="text-[9px] font-normal text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                      ✓ ভেরিফাইড ক্রেতা
                    </span>
                  </h4>
                  <p className="text-[11px] text-gray-500">{rev.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* কম্বো প্যাকেজ */}
      <section id="pricing" className="bg-[#0b0b0a] border-t border-[#c9a054]/10 py-20 scroll-mt-32">
        <div className="max-w-4xl mx-auto px-4 text-center mb-12">
          <h2 className="text-xl sm:text-3xl font-bold text-white">উৎসবের বিশেষ লাক্সারি কম্বো প্যাকেজ</h2>
          <p className="text-xs text-gray-400 mt-1">সীমিত সময়ের বিশেষ ছাড় ও জমকালো আকর্ষণ</p>
        </div>
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          <div className="bg-[#121211] p-8 rounded-2xl border border-gray-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">মেহেফিল কম্বো (কাপল সেট)</h3>
              <p className="text-2xl font-black text-[#c9a054]">৳৪,৫০০ <span className="text-xs text-gray-500 line-through">৳৬,০০০</span></p>
              <hr className="border-gray-800" />
              <ul className="text-xs text-gray-400 space-y-2.5 pt-2">
                <li>✓ ১টি প্রিমিয়াম জর্জেট/লিনেন থ্রি-পিস</li>
                <li>✓ ১টি এক্সক্লুসিভ সেমি-লং সুতি পাঞ্জাবি</li>
                <li>✓ মায়াবী সিগনেচার লাক্সারি বক্স প্যাকিং</li>
                <li>✓ ফ্রি হোম ডেলিভারি সুবিধা</li>
              </ul>
            </div>
            <Link
              href="#featured"
              className="w-full bg-[#1e1e1d] hover:bg-[#c9a054] hover:text-black border border-[#c9a054]/30 text-[#c9a054] text-xs font-bold py-3 rounded-xl transition-all text-center"
            >
              পণ্য পছন্দ করুন
            </Link>
          </div>
          <div className="bg-[#121211] p-8 rounded-2xl border-2 border-[#c9a054] space-y-6 relative flex flex-col justify-between">
            <span className="absolute -top-3 right-6 bg-[#c9a054] text-black font-extrabold text-[10px] px-3 py-1 rounded-full">সেরা ডিল</span>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">ব্রাইডাল/উৎসব মেগা সেট</h3>
              <p className="text-2xl font-black text-[#c9a054]">৳৬,৮০০ <span className="text-xs text-gray-500 line-through">৳৯,৫০০</span></p>
              <hr className="border-gray-800" />
              <ul className="text-xs text-gray-300 space-y-2.5 pt-2">
                <li>✓ ১টি এক্সক্লুসিভ কাতান/জামদানি শাড়ি</li>
                <li>✓ ১টি প্রিমিয়াম সিকোয়েন্স থ্রি-পিস সেট</li>
                <li>✓ রাজকীয় কাস্টমাইজড গিফট বক্সিং</li>
                <li>✓ ২৪ ঘণ্টার সুপার-ফাস্ট ডেলিভারি</li>
              </ul>
            </div>
            <Link
              href="#featured"
              className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] text-black text-xs font-bold py-3 rounded-xl transition-all shadow-md text-center"
            >
              কালেকশন থেকে কিনুন
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}