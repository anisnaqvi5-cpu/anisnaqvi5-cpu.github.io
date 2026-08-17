"use client";

import Link from "next/link";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { ProductCard } from "@/components/shop/ProductCard";
import { PRODUCTS } from "@/lib/ecommerce/catalog";
import { useShopStore } from "@/lib/shopStore";

function WishlistContent() {
  const wishlist = useShopStore((s) => s.wishlist);
  const products = wishlist.map((w) => PRODUCTS.find((p) => p.id === w.productId)).filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Wishlist</h1>
      {products.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save products you love for later."
          action={
            <Link href="/shop/products" className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Browse Products
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <WishlistContent />
    </ClientOnly>
  );
}
