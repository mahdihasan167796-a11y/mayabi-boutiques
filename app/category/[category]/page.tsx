import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getCategoryBySlug,
  getFeaturedCategories,
  type Category,
} from "@/lib/categories";

import { getProductsByCategory } from "@/lib/products";
import { CategoryFilterGrid } from "@/components/category-filter-grid";

export const revalidate = 0;

interface CategoryPageProps {
  params: {
    category: string;
  };
}

/* =========================
   SEO Metadata
========================= */

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const result: Category | undefined =
    await getCategoryBySlug(params.category);

  if (!result) {
    return {
      title: "ক্যাটাগরি পাওয়া যায়নি | Mayabi Boutiques",
    };
  }

  return {
    title: `${result.name} কালেকশন | Mayabi Boutiques`,
    description: `মায়াবী বুটিকস-এর ${result.name} কালেকশন — ${result.tag}। সারা বাংলাদেশে ক্যাশ অন ডেলিভারি।`,
    openGraph: {
      title: `${result.name} কালেকশন | Mayabi Boutiques`,
      description: `মায়াবী বুটিকস-এর ${result.name} প্রিমিয়াম কালেকশন।`,
      images: result.image
        ? [
            {
              url: result.image,
            },
          ]
        : [],
    },
  };
}

/* =========================
   Category Page
========================= */

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  /*
   * Promise-কে সম্পূর্ণ resolve করে Category object নেওয়া হচ্ছে।
   * এতে Vercel-এর "Property slug does not exist on type Promise<Category>"
   * টাইপ error এড়ানো যাবে।
   */
  const categoryResult = await Promise.resolve(
    getCategoryBySlug(params.category)
  );

  const category: Category | undefined = categoryResult;

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.slug);

  const featured = await getFeaturedCategories();

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      
      {/* =========================
          Category Header
      ========================= */}

      <div className="text-center mb-10">
        <span className="text-amber-400 font-semibold text-xs uppercase tracking-widest block mb-1">
          PREMIUM ARCHIVE
        </span>

        <h1 className="font-serif text-2xl md:text-4xl font-bold text-white">
          {category.name} কালেকশন সমাহার
        </h1>

        <p className="text-xs text-gray-500 mt-2">
          মায়াবী বুটিকস-এর আকর্ষণীয় প্রিমিয়াম ডিজাইনসমূহ
        </p>

        <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mt-4" />
      </div>

      {/* =========================
          Products
      ========================= */}

      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-500">
            এই ক্যাটাগরিতে এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
          </p>

          <p className="text-xs text-gray-600 mt-2">
            শীঘ্রই নতুন প্রিমিয়াম কালেকশন আসছে!
          </p>
        </div>
      ) : (
        <CategoryFilterGrid products={products} />
      )}

      {/* =========================
          Featured Categories
      ========================= */}

      {featured.length > 0 && (
        <section className="mt-20 pt-12 border-t border-white/10">
          
          <div className="text-center mb-10">
            <span className="text-amber-400 font-semibold text-xs uppercase tracking-widest block mb-1">
              TRENDING CATEGORIES
            </span>

            <h2 className="font-serif text-xl md:text-3xl font-bold text-white">
              আমাদের আকর্ষণীয় প্রিমিয়াম ক্যাটাগরি
            </h2>

            <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((cat) => (
              <Link
                key={cat.id ?? cat.slug}
                href={`/category/${cat.slug}`}
                className="
                  group relative rounded-3xl overflow-hidden
                  border border-white/10
                  bg-gradient-to-b from-white/[0.04] to-white/[0.01]
                  backdrop-blur-xl
                  hover:border-amber-500/40
                  hover:shadow-amber-500/20
                  transition-all duration-500 ease-out
                  flex flex-col
                  shadow-[0_20px_45px_-25px_rgba(0,0,0,0.9)]
                  hover:-translate-y-1.5
                "
              >
                {/* Image */}

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/40">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      className="
                        object-cover
                        transition-transform duration-500
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                      <span className="text-amber-400/60 text-xs">
                        MAYABI BOUTIQUES
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                  {cat.tag && (
                    <span className="
                      absolute top-3 left-3
                      bg-gradient-to-r from-amber-400 to-amber-600
                      text-black font-bold
                      text-[10px] sm:text-xs
                      px-2.5 py-1
                      rounded-full
                      shadow-md
                    ">
                      {cat.tag}
                    </span>
                  )}
                </div>

                {/* Category Info */}

                <div className="p-4 text-center flex-1 flex flex-col justify-center">
                  <h3 className="
                    font-serif font-semibold
                    text-white
                    text-sm sm:text-base
                    group-hover:text-amber-400
                    transition-colors duration-500
                  ">
                    {cat.name}
                  </h3>

                  <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                    এখনই অর্ডার করতে ক্লিক করুন →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
