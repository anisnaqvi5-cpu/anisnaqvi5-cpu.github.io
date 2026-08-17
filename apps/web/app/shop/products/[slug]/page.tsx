import { notFound } from "next/navigation";
import { PRODUCTS } from "@/lib/ecommerce/catalog";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
