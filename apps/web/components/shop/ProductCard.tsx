"use client";

import Link from "next/link";
import { Heart, Sparkles, Star } from "lucide-react";
import type { Product } from "@/lib/ecommerce/types";
import { formatCents } from "@/lib/ecommerce/format";
import { useShopStore } from "@/lib/shopStore";
import { useWellnessStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const locale = useWellnessStore((s) => s.locale);
  const wishlisted = useShopStore((s) => s.wishlist.some((w) => w.productId === product.id));
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);

  return (
    <div className="group relative rounded-card border border-border bg-surface p-4 shadow-soft transition hover:-translate-y-0.5">
      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label="Toggle wishlist"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80"
      >
        <Heart size={16} className={wishlisted ? "fill-accent text-accent" : "text-muted"} />
      </button>
      <Link href={`/shop/products/${product.slug}`}>
        <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-primary/5 text-5xl">{product.images[0]}</div>
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-foreground">{product.title[locale]}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-muted">{product.description[locale]}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-heading text-base text-foreground">{formatCents(product.basePriceCents)}</span>
          <span className="flex items-center gap-1 text-xs text-muted">
            <Star size={12} className="fill-accent text-accent" /> {product.avgRating} ({product.reviewCount})
          </span>
        </div>
        {product.isPersonalizable && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-pill bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
            <Sparkles size={11} /> Personalizable
          </span>
        )}
      </Link>
    </div>
  );
}
