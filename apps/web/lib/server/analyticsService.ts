import { readDb } from "@/lib/server/db";
import type { OrderRecord } from "@/lib/ecommerce/types";

const REVENUE_STATUSES: OrderRecord["status"][] = ["paid", "in_production", "shipped", "delivered", "refunded"];

export interface DashboardMetrics {
  revenueCents: number;
  refundedCents: number;
  netRevenueCents: number;
  orderCount: number;
  averageOrderValueCents: number;
  bestSellers: { productId: string; title: string; unitsSold: number; revenueCents: number }[];
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  personalizedItemCount: number;
  totalItemCount: number;
  personalizationRate: number; // 0-1
  topColors: { hex: string; count: number }[];
  paymentSuccessRate: number; // 0-1
  cancellationRate: number; // 0-1
  returnRate: number; // 0-1
  ordersByStatus: Record<OrderRecord["status"], number>;
}

/** rangeDays: window for "new customers" / order-count trend context; all
 * revenue/rate figures are computed over orders created within the window
 * (pass a large number, e.g. 36500, for "all time"). */
export function getDashboardMetrics(rangeDays: number): DashboardMetrics {
  return readDb((db) => {
    const since = Date.now() - rangeDays * 86_400_000;
    const orders = db.orders.filter((o) => new Date(o.createdAt).getTime() >= since);
    const orderIds = new Set(orders.map((o) => o.id));
    const items = db.orderItems.filter((i) => orderIds.has(i.orderId));

    const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const revenueCents = revenueOrders.reduce((sum, o) => sum + o.totalCents, 0);
    const refundedOrders = orders.filter((o) => o.status === "refunded");
    const refundedCents = refundedOrders.reduce((sum, o) => sum + o.totalCents, 0);
    const paidNonRefunded = orders.filter((o) => o.status === "paid" || o.status === "in_production" || o.status === "shipped" || o.status === "delivered");

    const unitsByProduct = new Map<string, { title: string; units: number; revenue: number }>();
    for (const item of items) {
      const entry = unitsByProduct.get(item.productId) ?? { title: item.productTitle, units: 0, revenue: 0 };
      entry.units += item.quantity;
      entry.revenue += item.lineTotalCents;
      unitsByProduct.set(item.productId, entry);
    }
    const bestSellers = Array.from(unitsByProduct.entries())
      .map(([productId, v]) => ({ productId, title: v.title, unitsSold: v.units, revenueCents: v.revenue }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    const byCustomer = new Map<string, OrderRecord[]>();
    for (const order of db.orders) {
      const list = byCustomer.get(order.customerId) ?? [];
      list.push(order);
      byCustomer.set(order.customerId, list);
    }
    let newCustomers = 0;
    let returningCustomers = 0;
    for (const [, custOrders] of byCustomer) {
      const sorted = [...custOrders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      const firstOrderInWindow = new Date(sorted[0].createdAt).getTime() >= since;
      if (firstOrderInWindow) newCustomers += 1;
      else if (custOrders.some((o) => orderIds.has(o.id))) returningCustomers += 1;
    }

    const personalizedItems = items.filter((i) => i.designSnapshot && i.designSnapshot.length > 0);
    const colorCounts = new Map<string, number>();
    for (const item of personalizedItems) {
      for (const el of item.designSnapshot ?? []) {
        if (el.type === "color" && el.value) colorCounts.set(el.value, (colorCounts.get(el.value) ?? 0) + 1);
      }
    }
    const topColors = Array.from(colorCounts.entries())
      .map(([hex, count]) => ({ hex, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const paymentsForOrders = db.payments.filter((p) => orderIds.has(p.orderId));
    const succeededPayments = paymentsForOrders.filter((p) => p.status === "succeeded").length;
    const attemptedPayments = paymentsForOrders.filter((p) => p.status === "succeeded" || p.status === "failed").length;

    const nonPendingOrders = orders.filter((o) => o.status !== "pending_payment");
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered" || o.status === "refunded").length;
    const returnsForWindow = db.returnRequests.filter((r) => orderIds.has(r.orderId)).length;

    const ordersByStatus = { pending_payment: 0, paid: 0, in_production: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0 } as Record<OrderRecord["status"], number>;
    for (const o of orders) ordersByStatus[o.status] += 1;

    return {
      revenueCents,
      refundedCents,
      netRevenueCents: revenueCents - refundedCents,
      orderCount: orders.length,
      averageOrderValueCents: paidNonRefunded.length ? Math.round(paidNonRefunded.reduce((s, o) => s + o.totalCents, 0) / paidNonRefunded.length) : 0,
      bestSellers,
      newCustomers,
      returningCustomers,
      totalCustomers: byCustomer.size,
      personalizedItemCount: personalizedItems.length,
      totalItemCount: items.length,
      personalizationRate: items.length ? personalizedItems.length / items.length : 0,
      topColors,
      paymentSuccessRate: attemptedPayments ? succeededPayments / attemptedPayments : 0,
      cancellationRate: nonPendingOrders.length ? cancelledOrders / nonPendingOrders.length : 0,
      returnRate: deliveredCount ? returnsForWindow / deliveredCount : 0,
      ordersByStatus,
    };
  });
}
