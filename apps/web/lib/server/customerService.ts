import type { CustomerSummary, OrderRecord } from "@/lib/ecommerce/types";
import { readDb } from "@/lib/server/db";

// There's no separate customer-account system yet (see ECOMMERCE_SYSTEM.md —
// checkout uses a client-generated pseudo customerId). "Customers" here means
// every distinct customerId seen across orders, aggregated — which is exactly
// what an Order Manager needs (spend, order count, repeat-purchase status).

function summarize(customerId: string, orders: OrderRecord[]): CustomerSummary {
  const paidOrders = orders.filter((o) => o.status !== "pending_payment" && o.status !== "cancelled");
  const sorted = [...orders].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return {
    customerId,
    orderCount: orders.length,
    totalSpentCents: paidOrders.reduce((sum, o) => sum + o.totalCents, 0),
    firstOrderAt: sorted[0]?.createdAt ?? "",
    lastOrderAt: sorted[sorted.length - 1]?.createdAt ?? "",
    isReturning: orders.length > 1,
  };
}

export function listCustomers(): CustomerSummary[] {
  return readDb((db) => {
    const byCustomer = new Map<string, OrderRecord[]>();
    for (const order of db.orders) {
      const list = byCustomer.get(order.customerId) ?? [];
      list.push(order);
      byCustomer.set(order.customerId, list);
    }
    return Array.from(byCustomer.entries())
      .map(([customerId, orders]) => summarize(customerId, orders))
      .sort((a, b) => b.totalSpentCents - a.totalSpentCents);
  });
}

export function getCustomer(customerId: string): { summary: CustomerSummary; orders: OrderRecord[] } | null {
  return readDb((db) => {
    const orders = db.orders.filter((o) => o.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (orders.length === 0) return null;
    return { summary: summarize(customerId, orders), orders };
  });
}
