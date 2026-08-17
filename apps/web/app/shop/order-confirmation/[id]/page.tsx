"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { formatCents } from "@/lib/ecommerce/format";
import { shopApi } from "@/lib/shopApi";
import type { OrderItemRecord, OrderRecord } from "@/lib/ecommerce/types";

function OrderConfirmationContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    shopApi
      .getOrder(params.id)
      .then((res) => {
        setOrder(res.order);
        setItems(res.items);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <DashboardSkeleton />;
  if (!order) return <p className="text-sm text-danger">Order not found.</p>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
      <CheckCircle2 size={56} className="text-primary" />
      <h1 className="font-heading text-2xl text-foreground">Order placed!</h1>
      <p className="text-sm text-muted">Order {order.orderNumber} — we&apos;ll email updates as it moves through production and shipping.</p>

      <Card className="w-full text-left">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between py-1 text-sm">
            <span className="text-foreground">
              {item.productTitle} × {item.quantity}
            </span>
            <span className="text-muted">{formatCents(item.lineTotalCents)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-heading text-base text-foreground">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </Card>

      <div className="flex w-full gap-2">
        <Link href={`/shop/orders/${order.id}`} className="flex-1 rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground">
          Track Order
        </Link>
        <Link href="/shop/products" className="flex-1 rounded-pill border border-border py-2.5 text-sm text-foreground">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <OrderConfirmationContent />
    </ClientOnly>
  );
}
