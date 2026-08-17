"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Sparkles, Star } from "lucide-react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { PersonalizationPanel } from "@/components/shop/PersonalizationPanel";
import { ReviewsSection } from "@/components/shop/ReviewsSection";
import type { DesignElement, Product } from "@/lib/ecommerce/types";
import { formatCents } from "@/lib/ecommerce/format";
import { useShopStore } from "@/lib/shopStore";
import { useWellnessStore } from "@/lib/store";

function ProductDetailContent({ product }: { product: Product }) {
  const locale = useWellnessStore((s) => s.locale);
  const router = useRouter();
  const wishlisted = useShopStore((s) => s.wishlist.some((w) => w.productId === product.id));
  const toggleWishlist = useShopStore((s) => s.toggleWishlist);
  const addToCart = useShopStore((s) => s.addToCart);
  const saveDesign = useShopStore((s) => s.saveDesign);

  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  const variant = product.variants.find((v) => v.id === variantId)!;
  const price = product.basePriceCents + variant.priceDeltaCents;

  const missingRequiredZones = product.isPersonalizable && product.printZones.some((z) => !designElements.find((e) => e.zoneId === z.id)?.value);

  function handleAddToCart() {
    let designId: string | undefined;
    if (product.isPersonalizable) {
      const design = saveDesign(product.id, `${product.title.en} design`, designElements);
      designId = design.id;
    }
    addToCart({ productId: product.id, variantId, designId, quantity });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-6">
      <button onClick={() => router.back()} className="self-start text-sm text-muted hover:text-foreground">
        ← Back
      </button>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex h-64 items-center justify-center rounded-card border border-border bg-primary/5 text-8xl">{product.images[0]}</div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-heading text-2xl text-foreground">{product.title[locale]}</h1>
              <button onClick={() => toggleWishlist(product.id)} aria-label="Toggle wishlist" className="flex h-9 w-9 items-center justify-center rounded-full border border-border">
                <Heart size={16} className={wishlisted ? "fill-accent text-accent" : "text-muted"} />
              </button>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted">
              <Star size={13} className="fill-accent text-accent" /> {product.avgRating} ({product.reviewCount} reviews)
            </p>
          </div>

          <p className="text-sm text-muted">{product.description[locale]}</p>

          <p className="font-heading text-2xl text-foreground">{formatCents(price)}</p>

          {product.variants.length > 1 && (
            <div>
              <p className="mb-1 text-xs text-muted">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.stockQty === 0}
                    className={`rounded-pill border px-3 py-1.5 text-sm transition disabled:opacity-40 ${
                      variantId === v.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"
                    }`}
                  >
                    {v.label}
                    {v.priceDeltaCents > 0 ? ` (+${formatCents(v.priceDeltaCents)})` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {variant.stockQty === 0 ? (
            <p className="text-sm font-medium text-danger">Out of stock</p>
          ) : variant.stockQty <= 5 ? (
            <p className="text-sm text-accent">Only {variant.stockQty} left</p>
          ) : null}

          {product.isPersonalizable && (
            <PersonalizationPanel zones={product.printZones} value={designElements} onChange={setDesignElements} />
          )}

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="h-8 w-8 rounded-full border border-border">
                −
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="h-8 w-8 rounded-full border border-border">
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={variant.stockQty === 0 || missingRequiredZones}
              className="flex-1 rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {justAdded ? "Added to cart ✓" : missingRequiredZones ? "Fill personalization to continue" : "Add to Cart"}
            </button>
          </div>
          {product.isPersonalizable && (
            <p className="flex items-center gap-1 text-xs text-muted">
              <Sparkles size={12} /> Your exact design is saved and linked to this order item — never just the product.
            </p>
          )}
        </div>
      </div>

      <ReviewsSection productId={product.id} />
    </div>
  );
}

export function ProductDetailClient({ product }: { product: Product }) {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <ProductDetailContent product={product} />
    </ClientOnly>
  );
}
