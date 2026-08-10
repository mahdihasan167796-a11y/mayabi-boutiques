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

  return (
    <div className="-mt-20 md:-mt-24">
      <ProductDetailClient product={product} reviews={formattedReviews} />
    </div>
  );
}