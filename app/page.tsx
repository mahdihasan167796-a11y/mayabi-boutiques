import { HeroBanner } from "@/components/hero-banner";
import { ProductCard } from "@/components/product-card";
import Link from "next/link";
import { getCategories, getFeaturedCategories } from "@/lib/categories";
import { getRecentProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import { supabase } from "@/lib/supabase";
export const revalidate = 0; // এটি পেজটিকে ক্যাশ করতে বাধা দেবে

export default async function HomePage() {
  const settings = await getSiteSettings();

  // "প্রোমো/হোম ব্যানার" ম্যানেজার থেকে placement অনুযায়ী হিরো ও মিড-পেজ ব্যানার আলাদা করে আনা হচ্ছে
  const { data: heroPromoData } = await supabase
    .from("promo_sections")
    .select("*")
    .eq("is_active", true)
    .eq("placement", "hero")
    .order("sort_order", { ascending: true });
  const heroBanners = heroPromoData || [];

  const { data: midPromoData } = await supabase
    .from("promo_sections")
    .select("*")
    .eq("is_active", true)
    .eq("placement", "mid")
    .order("sort_order", { ascending: true });
  const midBanners = midPromoData || [];

  // ফিচার্ড কালেকশন — শুধু যেগুলোতে অ্যাডমিন থেকে "হোমে ফিচারড" চালু আছে
  const featuredCategories = await getFeaturedCategories();
  // সকল ক্যাটাগরি — গোল আইকন সেকশনের জন্য, ফিচারড না হলেও দেখাবে
  const allCategories = await getCategories();

  // সাম্প্রতিক প্রোডাক্ট শোকেস — আগের hero-section/featured-collection ট্যাগের কোনো লিগ্যাসি প্রোডাক্ট
  // থেকে গেলে সেগুলো এখানে বাদ দেওয়া হচ্ছে
  const recentRaw = await getRecentProducts(12);
  const showcaseProducts = recentRaw
    .filter((p: any) => p.categorySlug !== "hero-section" && p.categorySlug !== "featured-collection")
    .slice(0, 8);

  // প্রথমে ডেটাবেজ থেকে অ্যাডমিনের হোম পেজের জন্য টিক দেওয়া রিভিউগুলো আনব
  let { data: dbReviews } = await supabase
    .from("reviews")
    .select("*")
    .eq("show_on_home", true)
    .order("created_at", { ascending: false });
  // যদি ডেটাবেজে কোনো রিভিউ না থাকে, তবে ডিফল্ট এই রিভিউগুলো দেখাবে
  const defaultReviews = [
    {
      name: "ফারজানা রহমান",
      location: "ঢাকা",
      rating: 5,
      comment: "পোশাকের ফ্যাব্রিকটি অসাধারণ ছিল। রেশমি সুতের কাজটা খুব নিখুঁত, ঠিক যেমনটা ছবিতে দেখেছি।",
    },
    {
      name: "তানভীর আহমেদ",
      location: "সিলেট",
      rating: 5,
      comment: "পাঞ্জাবির ফিটিং এবং কাপড়ের কোয়ালিটি দারুণ হয়েছে। প্যাকেজিংটা ভীষণ গর্জিয়াস লেগেছে।",
    },
    {
      name: "নূসরাত জাহান",
      location: "চট্টগ্রাম",
      rating: 5,
      comment: "খুব দ্রুত ডেলিভারি পেয়েছি। কাপড়ের প্রিমিয়াম কোয়ালিটি নিয়ে কোনো কম্প্রোমাইজ নেই।",
    },
  ];

  // ডেটাবেজে রিভিউ থাকলে সেটি দেখাবে, না থাকলে ডিফল্টগুলো দেখাবে
  const reviews = dbReviews && dbReviews.length > 0 ? dbReviews : defaultReviews;

  const whyUs = [
    { icon: "✨", title: "১০০% প্রিমিয়াম ফেব্রিক", desc: "আমরা সরাসরি বিশ্বস্ত সোর্স থেকে সবচেয়ে আরামদায়ক লাক্সারি সুতা ও ফেব্রিক সংগ্রহ করি।" },
    { icon: "🎨", title: "ইউনিক রাজকীয় ডিজাইন", desc: "আমাদের কারিগরদের তৈরি প্রতিটি ডিজাইন স্বতন্ত্র ও সীমিত সংস্করণের।" },
    { icon: "🤝", title: "সহজ রিটার্ন ও ক্যাশ অন ডেলিভারি", desc: "সারা বাংলাদেশে ঘরে বসে পণ্য দেখে মূল্য পরিশোধ ও ৭ দিনের ইজি এক্সচেঞ্জ সুবিধা।" },
  ];

  // কম্বো ১ ফীচারসমূহ
  const combo1FeaturesList = (settings.combo1Features || `১টি প্রিমিয়াম জর্জেট/লিনেন থ্রি-পিস\n১টি এক্সক্লুসিভ সেমি-লং সুতি পাঞ্জাবি\nমায়াবী সিগনেচার লাক্সারি বক্স প্যাকিং\nফ্রি হোম ডেলিভারি সুবিধা`).split('\n');

  // কম্বো ২ ফীচারসমূহ
  const combo2FeaturesList = (settings.combo2Features || `১টি এক্সক্লুসিভ কাতান/জামদানি শাড়ি\n১টি প্রিমিয়াম সিকোয়েন্স থ্রি-পিস সেট\nরাজকীয় কাস্টমাইজড গিফট বক্সিং\n২৪ ঘণ্টার সুপার-ফাস্ট ডেলিভারি`).split('\n');

  return (
    <>
      {/* ১. হিরো সেকশন — একাধিক ব্যানার/ভিডিও (এডমিনের "প্রোমো/হোম ব্যানার" → placement: হিরো) */}
      <div id="home">
        <HeroBanner banners={heroBanners} />
      </div>

      {/* ২. ফিচার্ড কালেকশন — বড় কার্ড + Shop Now (শুধু "হোমে ফিচারড" চালু থাকা ক্যাটাগরি) */}
      <section id="featured" className="bg-[#0b0b0a] border-t border-[#c9a054]/10 py-16 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-2">CURATED FOR YOU</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">আমাদের ফিচার্ড কালেকশন</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredCategories.map((col: any) => (
              <Link
                key={col.slug}
                href={`/category/${col.slug}`}
                className="group relative rounded-2xl overflow-hidden border border-[#c9a054]/15 shadow-xl aspect-[3/4] block transition-all duration-500 hover:border-[#c9a054]/50 hover:-translate-y-2"
              >
                <img
                  src={col.image}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {col.tag && (
                  <span className="absolute top-3 left-3 bg-[#c9a054] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {col.tag}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-center text-center gap-2.5">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white">{col.name}</h3>
                  <span className="inline-block bg-white text-black text-[10px] font-black uppercase tracking-wide px-4 py-2 rounded-full group-hover:bg-[#c9a054] transition-colors">
                    Shop Now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ৩. সকল ক্যাটাগরি — গোল ছবিতে (isFeatured নির্বিশেষে সব ক্যাটাগরি দেখাবে) */}
      {allCategories.length > 0 && (
        <section id="all-categories" className="bg-[#070706] border-t border-[#c9a054]/10 py-16 scroll-mt-32">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-2">BROWSE BY CATEGORY</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">সকল ক্যাটাগরি</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-x-7 gap-y-8 sm:gap-x-10">
              {allCategories.map((cat: any) => (
                <Link key={cat.slug} href={`/category/${cat.slug}`} className="group flex flex-col items-center gap-3 w-24 sm:w-28">
                  <span className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#c9a054]/30 group-hover:border-[#c9a054] transition-all duration-500 block shadow-lg">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-300 group-hover:text-[#c9a054] text-center transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ৪. মিড-পেজ ব্যানার/ভিডিও (এডমিনের "প্রোমো/হোম ব্যানার" → placement: মিড-পেজ) */}
      {midBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className={midBanners.length === 1 ? "grid grid-cols-1 gap-6" : "grid sm:grid-cols-2 gap-6"}>
            {midBanners.map((promo: any) => (
              <Link
                key={promo.id}
                href={promo.cta_link || "/"}
                className={`group relative rounded-3xl overflow-hidden border border-white/10 block ${
                  midBanners.length === 1 ? "aspect-[21/9]" : "aspect-[16/10]"
                }`}
              >
                {promo.media_type === "video" ? (
                  promo.image && (
                    <video
                      src={promo.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )
                ) : (
                  promo.image && (
                    <img
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  )
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">{promo.title}</h3>
                  {promo.subtitle && <p className="text-sm text-gray-300 mb-3">{promo.subtitle}</p>}
                  <span className="inline-block w-fit text-xs font-bold text-amber-400 border-b border-amber-500">
                    {promo.cta_label || "কালেকশন দেখুন"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ৫. প্রোডাক্ট শোকেস — বিভিন্ন ক্যাটাগরি থেকে সাম্প্রতিক প্রোডাক্ট, দামসহ */}
      {showcaseProducts.length > 0 && (
        <section id="new-arrivals" className="bg-[#0b0b0a] border-t border-[#c9a054]/10 py-16 scroll-mt-32">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-2">SHOP THE LATEST</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">আমাদের নতুন সংগ্রহ</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {showcaseProducts.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

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
          {reviews.map((rev: any) => (
            <div
              key={rev.id || rev.name || Math.random()}
              className="bg-[#111110] p-8 rounded-2xl border border-[#c9a054]/15 relative shadow-xl transition-all duration-300 hover:border-[#c9a054]/50 hover:-translate-y-2 flex flex-col justify-between group"
            >
              <span className="absolute top-4 right-6 text-6xl text-[#c9a054]/5 font-serif select-none">&ldquo;</span>
              <div className="space-y-4">
                <div className="flex text-[#c9a054] text-sm tracking-wide">
                  {"★".repeat(rev.rating || 5)}
                </div>
                <p className="text-xs sm:text-sm italic text-[#b5af9f] leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#c9a054]/10">
                <div className="w-10 h-10 rounded-full bg-[#1c1c1a] border border-[#c9a054]/40 flex items-center justify-center text-sm font-bold text-[#c9a054]">
                  {rev.name ? rev.name[0] : "C"}
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

        {settings.isOfferActive !== false ? (
          <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-8">
            {/* কম্বো ১ */}
            <div className="bg-[#121211] p-8 rounded-2xl border border-gray-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{settings.combo1Title || "মেহেফিল কম্বো (কাপল সেট)"}</h3>
                <p className="text-2xl font-black text-[#c9a054]">
                  ৳{settings.combo1Price || "৪,৫০০"} <span className="text-xs text-gray-500 line-through">৳{settings.combo1OldPrice || "৬,০০০"}</span>
                </p>
                <hr className="border-gray-800" />
                <ul className="text-xs text-gray-400 space-y-2.5 pt-2">
                  {combo1FeaturesList.map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
              <Link
                href="#featured"
                className="w-full bg-[#1e1e1d] hover:bg-[#c9a054] hover:text-black border border-[#c9a054]/30 text-[#c9a054] text-xs font-bold py-3 rounded-xl transition-all text-center block"
              >
                পণ্য পছন্দ করুন
              </Link>
            </div>

            {/* কম্বো ২ */}
            <div className="bg-[#121211] p-8 rounded-2xl border-2 border-[#c9a054] space-y-6 relative flex flex-col justify-between">
              <span className="absolute -top-3 right-6 bg-[#c9a054] text-black font-extrabold text-[10px] px-3 py-1 rounded-full">সেরা ডিল</span>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{settings.combo2Title || "ব্রাইডাল/উৎসব মেগা সেট"}</h3>
                <p className="text-2xl font-black text-[#c9a054]">
                  ৳{settings.combo2Price || "৬,৮০০"} <span className="text-xs text-gray-500 line-through">৳{settings.combo2OldPrice || "৯,৫০০"}</span>
                </p>
                <hr className="border-gray-800" />
                <ul className="text-xs text-gray-300 space-y-2.5 pt-2">
                  {combo2FeaturesList.map((feature, i) => (
                    <li key={i}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
              <Link
                href="#featured"
                className="w-full bg-gradient-to-r from-[#c9a054] to-[#967233] text-black text-xs font-bold py-3 rounded-xl transition-all shadow-md text-center block"
              >
                কালেকশন থেকে কিনুন
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto px-4 text-center bg-[#121211] border border-[#c9a054]/20 p-8 rounded-2xl">
            <p className="text-base font-bold text-[#c9a054]">
              {settings.noOfferMessage || "বর্তমানে কোনো বিশেষ অফার চালু নেই। নতুন অফারের জন্য আমাদের সাথেই থাকুন!"}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
