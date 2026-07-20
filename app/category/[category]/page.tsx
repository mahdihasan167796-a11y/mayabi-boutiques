import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getProductsByCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const category = getCategory(params.category);
  if (!category) notFound();

  const products = await getProductsByCategory(category.slug);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      <div className="text-center mb-10">
        <span className="text-[#c9a054] font-bold text-xs uppercase tracking-widest block mb-1">PREMIUM ARCHIVE</span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white">{category.name} কালেকশন সমাহার</h2>
        <p className="text-xs text-gray-500 mt-2">মায়াবী বুটিকস এর আকর্ষণীয় প্রিমিয়াম ডিজাইনসমূহ</p>
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
    </main>
  );
}
