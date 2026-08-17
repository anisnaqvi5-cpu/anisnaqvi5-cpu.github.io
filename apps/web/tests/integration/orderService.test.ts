import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Address, OrderItemInput } from "@/lib/ecommerce/types";

// db.ts resolves its JSON file path from process.cwd() at import time, so we
// chdir into an isolated temp directory *before* importing anything that
// (transitively) imports lib/server/db.ts. This keeps this test's data
// completely separate from the real dev .data/db.json and from other test files.
let tmpDir: string;
let orderService: typeof import("@/lib/server/orderService");
let catalogService: typeof import("@/lib/server/catalogService");
let dbModule: typeof import("@/lib/server/db");

const address: Address = {
  fullName: "Test Customer",
  phone: "+1-555-0100",
  line1: "1 Test Way",
  city: "Testville",
  country: "US",
};

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wellness-order-test-"));
  process.chdir(tmpDir);
  orderService = await import("@/lib/server/orderService");
  catalogService = await import("@/lib/server/catalogService");
  dbModule = await import("@/lib/server/db");
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function matVariant() {
  const product = catalogService.listProducts().find((p) => p.id === "prod-mat-flow")!;
  const variant = product.variants.find((v) => v.id === "var-mat-standard")!;
  return { product, variant };
}

describe("orderService.createOrder — order + inventory integrity", () => {
  it("decrements variant stock by the ordered quantity", async () => {
    const { variant } = matVariant();
    const startingStock = variant.stockQty;

    const items: OrderItemInput[] = [
      { variantId: "var-mat-standard", quantity: 2, design: { productId: "prod-mat-flow", elements: [{ zoneId: "mat-name", type: "text", value: "Sara" }] } },
    ];
    await orderService.createOrder({ customerId: "cust-1", idempotencyKey: "idem-stock-1", items, shippingAddress: address });

    const { variant: after } = matVariant();
    expect(after.stockQty).toBe(startingStock - 2);
  });

  it("rejects an order that exceeds available stock, without touching stock", async () => {
    const { variant } = matVariant();
    const hugeQty = variant.stockQty + 1000;
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: hugeQty, design: { productId: "prod-mat-flow", elements: [] } }];

    await expect(
      orderService.createOrder({ customerId: "cust-1", idempotencyKey: "idem-oversell", items, shippingAddress: address })
    ).rejects.toMatchObject({ code: "out_of_stock" });

    const { variant: after } = matVariant();
    expect(after.stockQty).toBe(variant.stockQty); // unchanged
  });

  it("is idempotent: retrying with the same idempotencyKey returns the original order, not a duplicate", async () => {
    const items: OrderItemInput[] = [{ variantId: "var-journal-std", quantity: 1, design: { productId: "prod-journal-gratitude", elements: [{ zoneId: "journal-name", type: "text", value: "Ali" }] } }];
    const key = "idem-retry-1";

    const first = await orderService.createOrder({ customerId: "cust-2", idempotencyKey: key, items, shippingAddress: address });
    const second = await orderService.createOrder({ customerId: "cust-2", idempotencyKey: key, items, shippingAddress: address });

    expect(second.order.id).toBe(first.order.id);
    const allOrders = orderService.listOrdersForCustomer("cust-2");
    expect(allOrders.filter((o) => o.idempotencyKey === key)).toHaveLength(1);
  });

  it("restocks the variant when a pending order is cancelled", async () => {
    const { variant } = matVariant();
    const before = variant.stockQty;
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [] } }];
    const { order } = await orderService.createOrder({ customerId: "cust-3", idempotencyKey: "idem-cancel-1", items, shippingAddress: address });

    expect(matVariant().variant.stockQty).toBe(before - 1);
    await orderService.cancelOrder(order.id, "cust-3");
    expect(matVariant().variant.stockQty).toBe(before);
  });
});

describe("orderService.createOrder — personalization-flow / design integrity", () => {
  it("requires a design for a personalizable product", async () => {
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1 }];
    await expect(
      orderService.createOrder({ customerId: "cust-4", idempotencyKey: "idem-design-required", items, shippingAddress: address })
    ).rejects.toMatchObject({ code: "design_required" });
  });

  it("rejects a design element referencing an unknown print zone", async () => {
    const items: OrderItemInput[] = [
      { variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [{ zoneId: "not-a-real-zone", type: "text", value: "x" }] } },
    ];
    await expect(
      orderService.createOrder({ customerId: "cust-4", idempotencyKey: "idem-bad-zone", items, shippingAddress: address })
    ).rejects.toMatchObject({ code: "invalid_design" });
  });

  it("rejects text exceeding the print zone's maxChars", async () => {
    const items: OrderItemInput[] = [
      { variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [{ zoneId: "mat-name", type: "text", value: "a".repeat(50) }] } },
    ];
    await expect(
      orderService.createOrder({ customerId: "cust-4", idempotencyKey: "idem-too-long", items, shippingAddress: address })
    ).rejects.toMatchObject({ code: "invalid_design" });
  });

  it("freezes the exact submitted design into the order item's designSnapshot", async () => {
    const elements = [
      { zoneId: "mat-name", type: "text" as const, value: "Zainab" },
      { zoneId: "mat-color", type: "color" as const, value: "#7A9471" },
    ];
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements } }];
    const { order } = await orderService.createOrder({ customerId: "cust-5", idempotencyKey: "idem-snapshot-1", items, shippingAddress: address });

    const { items: orderItems } = orderService.getOrder(order.id)!;
    expect(orderItems).toHaveLength(1);
    expect(orderItems[0].designSnapshot).toEqual(elements);
  });

  it("keeps two orders' design snapshots independent of each other", async () => {
    const designA = [{ zoneId: "mat-name", type: "text" as const, value: "Design A" }];
    const designB = [{ zoneId: "mat-name", type: "text" as const, value: "Design B" }];

    const { order: orderA } = await orderService.createOrder({
      customerId: "cust-6",
      idempotencyKey: "idem-independent-a",
      items: [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: designA } }],
      shippingAddress: address,
    });
    const { order: orderB } = await orderService.createOrder({
      customerId: "cust-6",
      idempotencyKey: "idem-independent-b",
      items: [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: designB } }],
      shippingAddress: address,
    });

    const itemsA = orderService.getOrder(orderA.id)!.items;
    const itemsB = orderService.getOrder(orderB.id)!.items;
    expect(itemsA[0].designSnapshot).toEqual(designA);
    expect(itemsB[0].designSnapshot).toEqual(designB);
  });
});

describe("orderService.applyPaymentEvent — payment-flow integrity", () => {
  it("moves a pending order to paid on payment_intent.succeeded", async () => {
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [] } }];
    const { order } = await orderService.createOrder({ customerId: "cust-7", idempotencyKey: "idem-pay-1", items, shippingAddress: address });
    const payment = dbModule.readDb((db) => db.payments.find((p) => p.orderId === order.id))!;

    await orderService.applyPaymentEvent({ id: "evt-succeed-1", type: "payment_intent.succeeded", paymentIntentId: payment.providerRef });

    const { order: after } = orderService.getOrder(order.id)!;
    expect(after.status).toBe("paid");
  });

  it("keeps the order in pending_payment (for retry) on payment_intent.payment_failed", async () => {
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [] } }];
    const { order } = await orderService.createOrder({ customerId: "cust-8", idempotencyKey: "idem-pay-fail-1", items, shippingAddress: address });
    const payment = dbModule.readDb((db) => db.payments.find((p) => p.orderId === order.id))!;

    await orderService.applyPaymentEvent({ id: "evt-fail-1", type: "payment_intent.payment_failed", paymentIntentId: payment.providerRef, failureReason: "card_declined" });

    const { order: after } = orderService.getOrder(order.id)!;
    expect(after.status).toBe("pending_payment");

    // Decline → retry: the client reuses the SAME idempotencyKey, so no duplicate order is created.
    const retry = await orderService.createOrder({ customerId: "cust-8", idempotencyKey: "idem-pay-fail-1", items, shippingAddress: address });
    expect(retry.order.id).toBe(order.id);
    const customerOrders = orderService.listOrdersForCustomer("cust-8");
    expect(customerOrders).toHaveLength(1);
  });

  it("is idempotent by event id: replaying the same succeeded event doesn't double-append status history", async () => {
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [] } }];
    const { order } = await orderService.createOrder({ customerId: "cust-9", idempotencyKey: "idem-pay-idem-1", items, shippingAddress: address });
    const payment = dbModule.readDb((db) => db.payments.find((p) => p.orderId === order.id))!;

    const event = { id: "evt-dup-1", type: "payment_intent.succeeded" as const, paymentIntentId: payment.providerRef };
    await orderService.applyPaymentEvent(event);
    const { order: afterFirst } = orderService.getOrder(order.id)!;
    const historyLenAfterFirst = afterFirst.statusHistory.length;

    await orderService.applyPaymentEvent(event); // simulated webhook retry (Stripe re-delivery)
    const { order: afterSecond } = orderService.getOrder(order.id)!;
    expect(afterSecond.statusHistory.length).toBe(historyLenAfterFirst);
    expect(afterSecond.status).toBe("paid");
  });

  it("restocks the variant when an admin refunds an order", async () => {
    const { variant } = matVariant();
    const before = variant.stockQty;
    const items: OrderItemInput[] = [{ variantId: "var-mat-standard", quantity: 1, design: { productId: "prod-mat-flow", elements: [] } }];
    const { order } = await orderService.createOrder({ customerId: "cust-10", idempotencyKey: "idem-refund-1", items, shippingAddress: address });
    expect(matVariant().variant.stockQty).toBe(before - 1);

    await orderService.adminRefundOrder(order.id);
    expect(matVariant().variant.stockQty).toBe(before);
    const { order: after } = orderService.getOrder(order.id)!;
    expect(after.status).toBe("refunded");
  });
});
