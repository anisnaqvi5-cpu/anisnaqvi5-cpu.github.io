"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { formatCents } from "@/lib/ecommerce/format";
import { shopApi } from "@/lib/shopApi";
import type { OrderItemRecord, OrderRecord, OrderStatus } from "@/lib/ecommerce/types";

const TIMELINE_STEPS: OrderStatus[] = ["paid", "in_production", "shipped", "delivered"];
const STEP_LABEL: Record<string, string> = { paid: "Order Confirmed", in_production: "In Production", shipped: "Shipped", delivered: "Delivered" };

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [returnItemId, setReturnItemId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState("");

  async function load() {
    const res = await shopApi.getOrder(params.id);
    setOrder(res.order);
    setItems(res.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) return <DashboardSkeleton />;
  if (!order) return <p className="text-sm text-danger">Order not found.</p>;

  const isTerminal = order.status === "cancelled" || order.status === "refunded";
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);
  const canCancel = order.status === "pending_payment" || order.status === "paid";
  const canReturn = order.status === "delivered";

  async function handleCancel() {
    setCancelling(true);
    setActionError("");
    try {
      await shopApi.cancelOrder(order!.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not cancel order.");
    } finally {
      setCancelling(false);
    }
  }

  async function submitReturn(itemId: string) {
    setActionError("");
    try {
      await shopApi.requestReturn(order!.id, itemId, returnReason || "Not specified");
      setReturnSubmitted((prev) => new Set(prev).add(itemId));
      setReturnItemId(null);
      setReturnReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not submit return request.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {actionError && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{actionError}</p>}

      {!isTerminal && (
        <Card>
          <div className="flex justify-between">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center gap-1 text-center">
                {i <= currentStepIndex ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} className="text-border" />}
                <span className={`text-[11px] ${i <= currentStepIndex ? "text-foreground" : "text-muted"}`}>{STEP_LABEL[step]}</span>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="mt-3 text-center text-xs text-muted">
              Tracking: {order.carrier ?? "Carrier"} #{order.trackingNumber}
            </p>
          )}
        </Card>
      )}

      <Card>
        <p className="mb-2 text-sm font-medium text-foreground">Items</p>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">
                  {item.productTitle} ({item.variantLabel}) × {item.quantity}
                </span>
                <span className="text-muted">{formatCents(item.lineTotalCents)}</span>
              </div>
              {item.designSnapshot && item.designSnapshot.length > 0 && (
                <p className="mt-1 text-xs text-primary">Personalized: {item.designSnapshot.map((e) => e.value).filter(Boolean).join(", ")}</p>
              )}
              {canReturn && (
                <div className="mt-2">
                  {returnSubmitted.has(item.id) ? (
                    <p className="text-xs text-primary">Return requested — pending review.</p>
                  ) : returnItemId === item.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        placeholder="Reason for return"
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => submitReturn(item.id)} className="rounded-pill bg-primary px-3 py-1 text-xs text-primary-foreground">
                          Submit
                        </button>
                        <button onClick={() => setReturnItemId(null)} className="rounded-pill border border-border px-3 py-1 text-xs text-muted">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setReturnItemId(item.id)} className="text-xs text-primary hover:underline">
                      Request return
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-2 font-heading text-base text-foreground">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </Card>

      <Card>
        <p className="mb-1 text-sm font-medium text-foreground">Status History</p>
        <ul className="flex flex-col gap-1.5">
          {order.statusHistory.map((h, i) => (
            <li key={i} className="text-xs text-muted">
              <span className="text-foreground">{new Date(h.at).toLocaleString()}</span> — {h.note}
            </li>
          ))}
        </ul>
      </Card>

      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="self-start rounded-pill border border-danger px-4 py-2 text-sm font-medium text-danger disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel Order"}
        </button>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <OrderDetailContent />
    </ClientOnly>
  );
}
