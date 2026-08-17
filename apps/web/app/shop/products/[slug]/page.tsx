import { notFound } from "next/navigation";
import { findProductBySlug } from "@/lib/server/catalogService";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

// Server component — reads the live catalog directly (no HTTP round-trip
// needed since this already runs server-side), so admin edits are visible
// immediately without waiting on client-side fetch/cache.
export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = findProductBySlug(params.slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
