"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { adminApi } from "@/lib/adminApi";
import type { OrderRecord, OrderStatus } from "@/lib/ecommerce/types";

const SHIPPING_STATUSES: OrderStatus[] = ["paid", "in_production", "shipped"];

function AdminShippingContent() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(SHIPPING_STATUSES.map((s) => adminApi.listOrders(s)))
      .then((results) => setOrders(results.flatMap((r) => r.orders).sort((a, b) => a.createdAt.localeCompare(b.createdAt))))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Shipping</h1>
        <p className="text-sm text-muted">Orders that are paid, in production, or shipped — set tracking from the order detail page.</p>
      </div>
      {orders.length === 0 ? (
        <EmptyState title="Nothing to ship right now" description="Orders ready for fulfillment will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/admin/orders/${o.id}`}>
              <Card className="flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-soft">
                <div>
                  <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                  <p className="text-xs text-muted">
                    {o.shippingAddress.fullName} · {o.shippingAddress.city}, {o.shippingAddress.country}
                    {o.trackingNumber && ` · ${o.carrier ?? "Carrier"} #${o.trackingNumber}`}
                  </p>
                </div>
                <OrderStatusBadge status={o.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminShippingPage() {
  const { checking } = useAdminGuard("shipping");
  if (checking) return <DashboardSkeleton />;
  return <AdminShippingContent />;
}
