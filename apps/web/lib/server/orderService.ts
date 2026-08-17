import crypto from "node:crypto";
import { findCoupon, findProductByVariantId, findVariant, SHIPPING_FEE_CENTS } from "@/lib/server/catalogService";
import type {
  Address,
  Coupon,
  DesignElement,
  OrderItemInput,
  OrderItemRecord,
  OrderRecord,
  OrderStatus,
  Review,
  ReturnRequest,
} from "@/lib/ecommerce/types";
import { withDb, readDb } from "@/lib/server/db";
import { OrderError } from "@/lib/server/errors";
import { getPaymentProvider, type NormalizedWebhookEvent } from "@/lib/server/paymentProvider";

function now() {
  return new Date().toISOString();
}

export { OrderError };

function computeDiscount(subtotalCents: number, coupon: Coupon | undefined): { discountCents: number; shippingFeeCents: number } {
  if (!coupon) return { discountCents: 0, shippingFeeCents: SHIPPING_FEE_CENTS };
  if (coupon.minOrderCents && subtotalCents < coupon.minOrderCents) {
    throw new OrderError("coupon_min_not_met", `Coupon ${coupon.code} requires a minimum order of $${(coupon.minOrderCents / 100).toFixed(2)}.`);
  }
  if (coupon.type === "percentage") return { discountCents: Math.round((subtotalCents * coupon.value) / 100), shippingFeeCents: SHIPPING_FEE_CENTS };
  if (coupon.type === "fixed_amount") return { discountCents: Math.min(coupon.value, subtotalCents), shippingFeeCents: SHIPPING_FEE_CENTS };
  if (coupon.type === "free_shipping") return { discountCents: 0, shippingFeeCents: 0 };
  return { discountCents: 0, shippingFeeCents: SHIPPING_FEE_CENTS };
}

function validateDesign(productZones: { id: string; type: string; maxChars?: number }[], elements: DesignElement[]) {
  for (const el of elements) {
    const zone = productZones.find((z) => z.id === el.zoneId);
    if (!zone) throw new OrderError("invalid_design", `Unknown print zone "${el.zoneId}".`);
    if (zone.type === "text" && zone.maxChars && el.value.length > zone.maxChars) {
      throw new OrderError("invalid_design", `Text for "${zone.id}" exceeds ${zone.maxChars} characters.`);
    }
  }
}

/** Read-only totals preview for the cart/checkout UI — recomputes from the
 * catalog exactly like createOrder does, but never touches the database. */
export function previewOrderTotals(items: OrderItemInput[], couponCode?: string) {
  let subtotalCents = 0;
  for (const item of items) {
    const found = (item.design?.productId ? findVariant(item.design.productId, item.variantId) : undefined) ?? findProductByVariantId(item.variantId);
    if (!found) throw new OrderError("invalid_item", `Unknown product variant "${item.variantId}".`);
    subtotalCents += (found.product.basePriceCents + found.variant.priceDeltaCents) * item.quantity;
  }
  const coupon = couponCode ? findCoupon(couponCode) : undefined;
  if (couponCode && !coupon) throw new OrderError("invalid_coupon", `Coupon "${couponCode}" is not valid.`);
  const { discountCents, shippingFeeCents } = computeDiscount(subtotalCents, coupon);
  const totalCents = Math.max(0, subtotalCents - discountCents) + shippingFeeCents;
  return { subtotalCents, discountCents, shippingFeeCents, totalCents, couponCode: coupon?.code ?? null };
}

/**
 * Creates a server-authoritative order from a cart payload. Prices, stock,
 * and coupon rules are ALL recomputed here — the client's numbers are never
 * trusted. Idempotent: retrying with the same idempotencyKey (e.g. a network
 * retry or a double-submitted form) returns the original order instead of
 * creating a duplicate.
 */
export async function createOrder(params: {
  customerId: string;
  idempotencyKey: string;
  items: OrderItemInput[];
  shippingAddress: Address;
  couponCode?: string;
}): Promise<{ order: OrderRecord; clientSecret: string }> {
  if (params.items.length === 0) throw new OrderError("empty_cart", "Cart is empty.");

  return withDb((db) => {
    const existing = db.orders.find((o) => o.idempotencyKey === params.idempotencyKey);
    if (existing) {
      const payment = db.payments.find((p) => p.orderId === existing.id);
      return { order: existing, clientSecret: payment ? clientSecretFor(payment.providerRef) : "" };
    }

    const orderItems: OrderItemRecord[] = [];
    let subtotalCents = 0;
    const orderId = crypto.randomUUID();

    for (const item of params.items) {
      const found = (item.design?.productId ? findVariant(item.design.productId, item.variantId) : undefined) ?? findProductByVariantId(item.variantId);
      if (!found) throw new OrderError("invalid_item", `Unknown product variant "${item.variantId}".`);
      const { product, variant } = found;

      if (variant.stockQty < item.quantity) {
        throw new OrderError("out_of_stock", `"${product.title.en}" (${variant.label}) has only ${variant.stockQty} left in stock.`);
      }

      if (product.isPersonalizable && !item.design) {
        throw new OrderError("design_required", `"${product.title.en}" requires a personalization design before it can be ordered.`);
      }
      if (item.design) validateDesign(product.printZones, item.design.elements);

      const unitPriceCents = product.basePriceCents + variant.priceDeltaCents;
      const lineTotalCents = unitPriceCents * item.quantity;
      subtotalCents += lineTotalCents;

      orderItems.push({
        id: crypto.randomUUID(),
        orderId,
        productId: product.id,
        variantId: variant.id,
        productTitle: product.title.en,
        variantLabel: variant.label,
        unitPriceCents,
        quantity: item.quantity,
        lineTotalCents,
        // Frozen at order time — later edits to a saved design never affect
        // an already-placed order. See ECOMMERCE_SYSTEM.md "Personalization Linkage".
        designSnapshot: item.design ? item.design.elements : null,
      });
    }

    const coupon = params.couponCode ? findCoupon(params.couponCode) : undefined;
    if (params.couponCode && !coupon) throw new OrderError("invalid_coupon", `Coupon "${params.couponCode}" is not valid.`);
    const { discountCents, shippingFeeCents } = computeDiscount(subtotalCents, coupon);
    const totalCents = Math.max(0, subtotalCents - discountCents) + shippingFeeCents;

    const order: OrderRecord = {
      id: orderId,
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
      customerId: params.customerId,
      status: "pending_payment",
      idempotencyKey: params.idempotencyKey,
      subtotalCents,
      discountCents,
      shippingFeeCents,
      totalCents,
      currency: "USD",
      couponCode: coupon?.code ?? null,
      shippingAddress: params.shippingAddress,
      paymentIntentId: null,
      createdAt: now(),
      updatedAt: now(),
      statusHistory: [{ status: "pending_payment", note: "Order created", at: now() }],
    };

    db.orders.push(order);
    db.orderItems.push(...orderItems);

    return { order, clientSecret: "" };
  }).then(async ({ order }) => {
    // Payment-intent creation is async (may call out to Stripe), so it runs
    // outside the synchronous db transaction above, then patches the order.
    const provider = getPaymentProvider();
    const intent = await provider.createPaymentIntent({ amountCents: order.totalCents, currency: order.currency, orderId: order.id });

    return withDb((db) => {
      const freshOrder = db.orders.find((o) => o.id === order.id)!;
      freshOrder.paymentIntentId = intent.id;
      freshOrder.updatedAt = now();
      db.payments.push({
        id: crypto.randomUUID(),
        orderId: order.id,
        provider: provider.name,
        providerRef: intent.id,
        amountCents: order.totalCents,
        currency: order.currency,
        status: "pending",
        createdAt: now(),
        updatedAt: now(),
      });
      return { order: freshOrder, clientSecret: intent.clientSecret };
    });
  });
}

function clientSecretFor(paymentIntentId: string) {
  return `${paymentIntentId}_secret_mock`;
}

/**
 * Applies a normalized payment event (from either the real Stripe webhook
 * route or the mock simulate-payment route — identical code path either
 * way) to the matching payment + order, idempotently by event id.
 */
export async function applyPaymentEvent(event: NormalizedWebhookEvent): Promise<void> {
  await withDb((db) => {
    if (db.processedWebhookEventIds.includes(event.id)) return; // duplicate delivery — no-op
    db.processedWebhookEventIds.push(event.id);

    const payment = db.payments.find((p) => p.providerRef === event.paymentIntentId);
    if (!payment) return; // unknown intent — ignore rather than throw (webhooks must always 200)
    const order = db.orders.find((o) => o.id === payment.orderId);
    if (!order) return;

    if (event.type === "payment_intent.succeeded") {
      payment.status = "succeeded";
      payment.updatedAt = now();
      if (order.status === "pending_payment") {
        order.status = "paid";
        order.statusHistory.push({ status: "paid", note: "Payment confirmed", at: now() });
      }
    } else if (event.type === "payment_intent.payment_failed") {
      payment.status = "failed";
      payment.failureReason = event.failureReason;
      payment.updatedAt = now();
      // Order stays in pending_payment so the customer can retry — a failed
      // charge attempt never creates a second order (idempotencyKey is reused
      // client-side across retries within the same checkout).
      order.statusHistory.push({ status: order.status, note: `Payment failed: ${event.failureReason ?? "declined"}`, at: now() });
    } else if (event.type === "charge.refunded") {
      payment.status = "refunded";
      order.status = "refunded";
      order.statusHistory.push({ status: "refunded", note: "Payment refunded", at: now() });
    }
    order.updatedAt = now();
  });
}

const CANCELLABLE_STATUSES: OrderStatus[] = ["pending_payment", "paid"];

export async function cancelOrder(orderId: string, customerId: string): Promise<OrderRecord> {
  return withDb((db) => {
    const order = db.orders.find((o) => o.id === orderId && o.customerId === customerId);
    if (!order) throw new OrderError("not_found", "Order not found.");
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new OrderError("not_cancellable", `Orders in "${order.status}" status can no longer be cancelled.`);
    }
    order.status = "cancelled";
    order.statusHistory.push({ status: "cancelled", note: "Cancelled by customer", at: now() });
    order.updatedAt = now();
    return order;
  });
}

const RETURN_WINDOW_DAYS = 14;

export async function requestReturn(params: { orderId: string; orderItemId: string; customerId: string; reason: string }) {
  return withDb((db) => {
    const order = db.orders.find((o) => o.id === params.orderId && o.customerId === params.customerId);
    if (!order) throw new OrderError("not_found", "Order not found.");
    if (order.status !== "delivered") throw new OrderError("not_returnable", "Only delivered orders can be returned.");
    const deliveredEntry = [...order.statusHistory].reverse().find((h) => h.status === "delivered");
    if (deliveredEntry) {
      const daysSince = (Date.now() - new Date(deliveredEntry.at).getTime()) / 86_400_000;
      if (daysSince > RETURN_WINDOW_DAYS) throw new OrderError("return_window_closed", `The ${RETURN_WINDOW_DAYS}-day return window has passed.`);
    }
    const item = db.orderItems.find((i) => i.id === params.orderItemId && i.orderId === params.orderId);
    if (!item) throw new OrderError("not_found", "Order item not found.");

    const request = {
      id: crypto.randomUUID(),
      orderId: params.orderId,
      orderItemId: params.orderItemId,
      reason: params.reason,
      status: "requested" as const,
      createdAt: now(),
      updatedAt: now(),
    };
    db.returnRequests.push(request);
    return request;
  });
}

export function getOrder(orderId: string, customerId?: string): { order: OrderRecord; items: OrderItemRecord[] } | null {
  return readDb((db) => {
    const order = db.orders.find((o) => o.id === orderId && (!customerId || o.customerId === customerId));
    if (!order) return null;
    return { order, items: db.orderItems.filter((i) => i.orderId === orderId) };
  });
}

export function listOrdersForCustomer(customerId: string): OrderRecord[] {
  return readDb((db) => db.orders.filter((o) => o.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

// ---- Reviews ---------------------------------------------------------------
export async function createReview(params: { productId: string; orderItemId: string; customerId: string; rating: 1 | 2 | 3 | 4 | 5; comment: string }): Promise<Review> {
  return withDb((db) => {
    const item = db.orderItems.find((i) => i.id === params.orderItemId);
    if (!item || item.productId !== params.productId) throw new OrderError("invalid_review", "Order item does not match this product.");
    const order = db.orders.find((o) => o.id === item.orderId && o.customerId === params.customerId);
    if (!order) throw new OrderError("invalid_review", "You can only review products from your own orders.");
    if (order.status !== "delivered") throw new OrderError("invalid_review", "You can review a product once your order is delivered.");
    if (db.reviews.some((r) => r.orderItemId === params.orderItemId)) throw new OrderError("already_reviewed", "You already reviewed this order item.");

    // Pending until a content_manager/admin approves — keeps low-quality or
    // abusive text off the public product page automatically.
    const review: Review = { id: crypto.randomUUID(), createdAt: now(), status: "pending", ...params };
    db.reviews.push(review);
    return review;
  });
}

/** Public product page — approved reviews only. */
export function listReviews(productId: string): Review[] {
  return readDb((db) =>
    db.reviews.filter((r) => r.productId === productId && r.status === "approved").sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

/** Admin (content_manager) moderation queue — every status. */
export function listAllReviews(): Review[] {
  return readDb((db) => [...db.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function moderateReview(reviewId: string, status: "approved" | "rejected"): Promise<Review> {
  const updated = await withDb((db) => {
    const review = db.reviews.find((r) => r.id === reviewId);
    if (!review) throw new OrderError("not_found", "Review not found.");
    review.status = status;
    return review;
  });

  // Recompute the product's public rating from approved reviews only —
  // pending/rejected reviews never influence what shoppers see.
  await withDb((db) => {
    const productReviews = db.reviews.filter((r) => r.productId === updated.productId && r.status === "approved");
    const product = db.products.find((p) => p.id === updated.productId);
    if (product) {
      product.reviewCount = productReviews.length;
      product.avgRating = productReviews.length ? Math.round((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length) * 10) / 10 : 0;
    }
  });

  return updated;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await withDb((db) => {
    db.reviews = db.reviews.filter((r) => r.id !== reviewId);
  });
}

// ---- Admin -------------------------------------------------------------
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["in_production", "cancelled", "refunded"],
  in_production: ["shipped", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export async function adminUpdateOrderStatus(orderId: string, nextStatus: OrderStatus, note: string, extra?: { trackingNumber?: string; carrier?: string }): Promise<OrderRecord> {
  return withDb((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) throw new OrderError("not_found", "Order not found.");
    if (!VALID_TRANSITIONS[order.status].includes(nextStatus)) {
      throw new OrderError("invalid_transition", `Cannot move an order from "${order.status}" to "${nextStatus}".`);
    }
    order.status = nextStatus;
    if (extra?.trackingNumber) order.trackingNumber = extra.trackingNumber;
    if (extra?.carrier) order.carrier = extra.carrier;
    order.statusHistory.push({ status: nextStatus, note: note || `Status updated to ${nextStatus}`, at: now() });
    order.updatedAt = now();
    return order;
  });
}

export async function adminRefundOrder(orderId: string): Promise<OrderRecord> {
  const order = readDb((db) => db.orders.find((o) => o.id === orderId));
  if (!order) throw new OrderError("not_found", "Order not found.");
  if (!order.paymentIntentId) throw new OrderError("no_payment", "This order has no associated payment to refund.");

  const provider = getPaymentProvider();
  await provider.refund(order.paymentIntentId);

  return withDb((db) => {
    const fresh = db.orders.find((o) => o.id === orderId)!;
    const payment = db.payments.find((p) => p.orderId === orderId);
    if (payment) {
      payment.status = "refunded";
      payment.updatedAt = now();
    }
    fresh.status = "refunded";
    fresh.statusHistory.push({ status: "refunded", note: "Refunded by admin", at: now() });
    fresh.updatedAt = now();
    return fresh;
  });
}

export async function adminResolveReturn(returnId: string, action: "approve" | "reject"): Promise<void> {
  await withDb((db) => {
    const request = db.returnRequests.find((r) => r.id === returnId);
    if (!request) throw new OrderError("not_found", "Return request not found.");
    request.status = action === "approve" ? "approved" : "rejected";
    request.updatedAt = now();
  });
  if (action === "approve") {
    const request = readDb((db) => db.returnRequests.find((r) => r.id === returnId));
    if (request) await adminRefundOrder(request.orderId);
  }
}

export function listAllOrders(statusFilter?: OrderStatus): OrderRecord[] {
  return readDb((db) => db.orders.filter((o) => !statusFilter || o.status === statusFilter).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export function listReturnRequests(): ReturnRequest[] {
  return readDb((db) => [...db.returnRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}
