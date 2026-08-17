"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { findVariantInList } from "@/lib/ecommerce/lookup";
import { formatCents } from "@/lib/ecommerce/format";
import { useShopStore, getDesign } from "@/lib/shopStore";
import { shopApi } from "@/lib/shopApi";
import { useCatalogStore, useEnsureCatalog } from "@/lib/useCatalogStore";
import type { OrderItemInput } from "@/lib/ecommerce/types";

function CartContent() {
  useEnsureCatalog();
  const products = useCatalogStore((s) => s.products);
  const cartItems = useShopStore((s) => s.cartItems);
  const designs = useShopStore((s) => s.designs);
  const updateQuantity = useShopStore((s) => s.updateQuantity);
  const removeFromCart = useShopStore((s) => s.removeFromCart);

  const [couponCode, setCouponCode] = useState("");
  const [totals, setTotals] = useState<{ subtotalCents: number; discountCents: number; shippingFeeCents: number; totalCents: number } | null>(null);
  const [couponError, setCouponError] = useState("");

  const items: OrderItemInput[] = [];
  for (const c of cartItems) {
    const found = findVariantInList(products, c.productId, c.variantId);
    if (!found) continue;
    const design = getDesign(designs, c.designId);
    items.push({ variantId: c.variantId, quantity: c.quantity, design: design ? { productId: c.productId, elements: design.elements } : undefined });
  }

  useEffect(() => {
    if (items.length === 0) {
      setTotals(null);
      return;
    }
    setCouponError("");
    shopApi
      .previewTotals(items, couponCode || undefined)
      .then(setTotals)
      .catch((err) => setCouponError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items), couponCode]);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Cart</h1>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Start shopping to add products here."
          action={
            <Link href="/shop/products" className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {cartItems.map((c) => {
              const found = findVariantInList(products, c.productId, c.variantId);
              if (!found) return null;
              const design = getDesign(designs, c.designId);
              const unitPrice = found.product.basePriceCents + found.variant.priceDeltaCents;
              return (
                <Card key={c.id} className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-2xl">{found.product.images[0]}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{found.product.title.en}</p>
                    <p className="text-xs text-muted">{found.variant.label}</p>
                    {design && (
                      <p className="mt-1 text-xs text-primary">
                        Personalized: {design.elements.map((e) => e.value).filter(Boolean).join(", ") || "custom design"}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2">
                      <button onClick={() => updateQuantity(c.id, c.quantity - 1)} className="h-6 w-6 rounded-full border border-border text-xs">
                        −
                      </button>
                      <span className="text-xs">{c.quantity}</span>
                      <button onClick={() => updateQuantity(c.id, c.quantity + 1)} className="h-6 w-6 rounded-full border border-border text-xs">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-medium text-foreground">{formatCents(unitPrice * c.quantity)}</span>
                    <button onClick={() => removeFromCart(c.id)} aria-label="Remove" className="text-muted hover:text-danger">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card>
            <label className="mb-2 block text-sm font-medium text-foreground">Coupon code</label>
            <div className="flex gap-2">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </div>
            {couponError && <p className="mt-1 text-xs text-danger">{couponError}</p>}

            {totals && (
              <div className="mt-4 flex flex-col gap-1 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatCents(totals.subtotalCents)}</span>
                </div>
                {totals.discountCents > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>−{formatCents(totals.discountCents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{totals.shippingFeeCents === 0 ? "Free" : formatCents(totals.shippingFeeCents)}</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-border pt-2 font-heading text-base text-foreground">
                  <span>Total</span>
                  <span>{formatCents(totals.totalCents)}</span>
                </div>
              </div>
            )}

            <Link
              href="/shop/checkout"
              className="mt-4 block rounded-pill bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
          </Card>
        </>
      )}
    </div>
  );
}

export default function CartPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <CartContent />
    </ClientOnly>
  );
}
