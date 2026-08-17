"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { formatCents } from "@/lib/ecommerce/format";
import { shopApi } from "@/lib/shopApi";
import type { OrderRecord } from "@/lib/ecommerce/types";

function OrdersContent() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopApi.listOrders().then((r) => setOrders(r.orders)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">My Orders</h1>
      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Your order history will appear here."
          action={
            <Link href="/shop/products" className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Start Shopping
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o.id} href={`/shop/orders/${o.id}`}>
              <Card className="flex items-center justify-between transition hover:-translate-y-0.5 hover:shadow-soft">
                <div>
                  <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                  <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
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

export default function OrdersPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <OrdersContent />
    </ClientOnly>
  );
}
