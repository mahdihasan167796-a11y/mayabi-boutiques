import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
