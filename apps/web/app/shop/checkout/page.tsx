"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { MockPaymentForm } from "@/components/shop/MockPaymentForm";
import { StripePaymentForm } from "@/components/shop/StripePaymentForm";
import { findVariant } from "@/lib/ecommerce/catalog";
import { formatCents } from "@/lib/ecommerce/format";
import { useShopStore, getDesign } from "@/lib/shopStore";
import { shopApi } from "@/lib/shopApi";
import type { Address, OrderItemInput, OrderRecord } from "@/lib/ecommerce/types";

function CheckoutContent() {
  const router = useRouter();
  const cartItems = useShopStore((s) => s.cartItems);
  const designs = useShopStore((s) => s.designs);
  const clearCart = useShopStore((s) => s.clearCart);
  const startCheckout = useShopStore((s) => s.startCheckout);
  const clearCheckout = useShopStore((s) => s.clearCheckout);

  const [address, setAddress] = useState<Address>({ fullName: "", phone: "", line1: "", line2: "", city: "", country: "US", postalCode: "" });
  const [couponCode, setCouponCode] = useState("");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [provider, setProvider] = useState<"stripe" | "mock" | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [declinedNote, setDeclinedNote] = useState("");

  useEffect(() => {
    if (cartItems.length === 0 && !order) router.replace("/shop/cart");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems.length]);

  const items: OrderItemInput[] = [];
  for (const c of cartItems) {
    const found = findVariant(c.productId, c.variantId);
    if (!found) continue;
    const design = getDesign(designs, c.designId);
    items.push({ variantId: c.variantId, quantity: c.quantity, design: design ? { productId: c.productId, elements: design.elements } : undefined });
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setPlacing(true);
    setPlaceError("");
    try {
      const idempotencyKey = startCheckout();
      const result = await shopApi.createOrder({ idempotencyKey, items, shippingAddress: address, couponCode: couponCode || undefined });
      setOrder(result.order);
      setProvider(result.provider);
      setClientSecret(result.clientSecret);
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : "Could not place order.");
    } finally {
      setPlacing(false);
    }
  }

  async function handleSettled(outcome: "succeed" | "decline") {
    if (!order) return;
    if (outcome === "decline") {
      setDeclinedNote("Your payment was declined. You can try again below — this won't create a duplicate order.");
      return;
    }
    setDeclinedNote("");
    const fresh = await shopApi.getOrder(order.id);
    if (fresh.order.status === "paid") {
      clearCart();
      clearCheckout();
      router.push(`/shop/order-confirmation/${order.id}`);
    }
  }

  if (order) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="font-heading text-xl text-foreground">Payment</h1>
        <Card>
          <p className="text-sm text-muted">Order {order.orderNumber}</p>
          <p className="font-heading text-2xl text-foreground">{formatCents(order.totalCents)}</p>
        </Card>
        {declinedNote && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{declinedNote}</p>}
        {provider === "mock" && order.paymentIntentId && <MockPaymentForm paymentIntentId={order.paymentIntentId} onSettled={handleSettled} />}
        {provider === "stripe" && clientSecret && <StripePaymentForm clientSecret={clientSecret} onSuccess={() => handleSettled("succeed")} />}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Checkout</h1>
      <form onSubmit={placeOrder} className="flex flex-col gap-3">
        <Card className="flex flex-col gap-3">
          <p className="text-sm font-medium text-foreground">Shipping Address</p>
          <input required placeholder="Full name" value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input required placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input required placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input placeholder="Address line 2 (optional)" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-medium text-foreground">Coupon (optional)</p>
          <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </Card>

        {placeError && <p className="text-sm text-danger">{placeError}</p>}

        <button disabled={placing} className="rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
          {placing ? "Placing order..." : "Continue to Payment"}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <CheckoutContent />
    </ClientOnly>
  );
}
