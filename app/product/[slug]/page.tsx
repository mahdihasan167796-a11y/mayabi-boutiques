import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { ProductDetailClient } from "./product-detail-client";

// 🎯 ক্যাশ সম্পূর্ণ বন্ধ করে লাইভ স্টক ডাটা নিশ্চিত করার জন্য:
export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await params;
  
  // 🔹 বাংলা স্লাগকে সঠিক ডিকোড করে নেওয়া হচ্ছে (যাতে 404 এরর না আসে)
  const decodedSlug = decodeURIComponent(resolvedParams.slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}