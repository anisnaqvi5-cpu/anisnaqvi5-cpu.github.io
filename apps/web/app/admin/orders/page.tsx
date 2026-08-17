"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { formatCents } from "@/lib/ecommerce/format";
import { adminApi } from "@/lib/adminApi";
import type { OrderRecord, OrderStatus } from "@/lib/ecommerce/types";

const TABS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "in_production", label: "In Production" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default function AdminOrdersPage() {
  const { checking } = useAdminGuard("orders");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checking) return;
    setLoading(true);
    adminApi
      .listOrders(tab === "all" ? undefined : tab)
      .then((r) => setOrders(r.orders))
      .finally(() => setLoading(false));
  }, [checking, tab]);

  if (checking) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Orders</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`rounded-pill border px-3 py-1 text-xs ${tab === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders in this status" description="Orders matching this filter will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`}>
              <Card className="flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-soft">
                <div>
                  <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{o.shippingAddress.fullName} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-foreground">{formatCents(o.totalCents)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
