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

  // ২. একই ক্যাটাগরির Related Products (আপনাদের পছন্দের আরও কিছু কালেকশন) ফেচ করা
  let relatedProducts = [];
  try {
    const { data: relatedData, error: relatedError } = await supabase
      .from("products")
      .select("*")
     .eq("category", (product as any).category) // বর্তমান প্রোডাক্টের ক্যাটাগরি অনুযায়ী
      .neq("id", product.id)             // বর্তমান প্রোডাক্টটি বাদ দিয়ে
      .limit(4);                         // সর্বোচ্চ ৪টি প্রোডাক্ট ফেচ করবে

    if (!relatedError && relatedData) {
      relatedProducts = relatedData;
    }
  } catch (err) {
    console.error("Related products fetch error:", err);
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