export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { ProductDetailClient } from "./product-detail-client";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const decodedSlug = decodeURIComponent(params.slug);
  const product = await getProductBySlug(decodedSlug);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}