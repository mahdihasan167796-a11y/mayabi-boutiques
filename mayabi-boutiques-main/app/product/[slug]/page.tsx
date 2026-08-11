import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProductBySlug } from "@/lib/products";
import ProductDetailClient from "./product-detail-client";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) notFound();

  // ১. রিভিউ ফেচ করা
  let formattedReviews = [];
  try {
    const { data: productReviews, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id);

    if (!error && productReviews) {
      formattedReviews = productReviews.filter(
        (r: any) => r.show_on_product === true || r.show_on_home === true || r.is_approved === true
      );
    }
  } catch (err) {
    console.error("Review fetch error:", err);
  }

 // ২. একই ক্যাটাগরির Related Products ফেচ করা
  let relatedProducts: any[] = [];
  try {
    // ১. একই ক্যাটাগরির প্রোডাক্ট খোঁজার চেষ্টা
    const { data: categoryData } = await supabase
      .from("products")
      .select("*")
      .eq("category", (product as any).category)
      .neq("id", product.id)
      .limit(4);

    if (categoryData && categoryData.length > 0) {
      relatedProducts = categoryData;
    } else {
      // ২. ক্যাটাগরি না মিললে অন্য যেকোনো ৪টি প্রোডাক্ট
      const { data: latestData } = await supabase
        .from("products")
        .select("*")
        .neq("id", product.id)
        .limit(4);

      relatedProducts = latestData || [];
    }
  } catch (err) {
    console.error("Related products fetch error:", err);
    relatedProducts = [];
  }

  return (
    <div className="-mt-20 md:-mt-24">
      <ProductDetailClient 
        product={product} 
        reviews={formattedReviews} 
        relatedProducts={relatedProducts} 
      />
    </div>
  );
}