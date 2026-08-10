import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { categories, featuredCategorySlugs, getCategory } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const revalidate = 0;

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const products = await getProductsByCategory(category.slug);

  const featured = featuredCategorySlugs
    .map((slug) => categories.find((c) => c.slug === slug))
    .filter(Boolean) as typeof categories;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      <div className="text-center mb-10">
        <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-1">
          PREMIUM ARCHIVE
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white">
          {category.name} কালেকশন সমাহার
        </h2>
        <p className="text-xs text-gray-500 mt-2">
          মায়াবী বুটিকস এর আকর্ষণীয় প্রিমিয়াম ডিজাইনসমূহ
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-24">
          এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি। শীঘ্রই নতুন কালেকশন আসছে!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* ফিচারড ক্যাটাগরি সেকশন */}
      <section className="mt-20 pt-12 border-t border-[#c9a054]/15">
        <div className="text-center mb-10">
          <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-1">
            TRENDING CATEGORIES
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold text-white">
            আমাদের আকর্ষণীয় প্রিমিয়াম ক্যাটাগরি
          </h2>
          <div className="w-16 h-0.5 bg-[#c9a054] mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative bg-[#111110] rounded-2xl overflow-hidden border border-[#c9a054]/15 hover:border-[#c9a054]/50 transition-all duration-300 flex flex-col shadow-lg hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1c1c1a]">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                <span className="absolute top-3 left-3 bg-[#c9a054] text-black font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full shadow-md">
                  {cat.tag}
                </span>
              </div>
              <div className="p-4 text-center flex-1 flex flex-col justify-center bg-gradient-to-b from-[#111110] to-[#0a0a0a]">
                <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-[#c9a054] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                  এখনই অর্ডার করতে ক্লিক করুন &rarr;
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}