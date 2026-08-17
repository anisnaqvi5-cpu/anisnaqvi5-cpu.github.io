"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { OrderStatusBadge } from "@/components/shop/OrderStatusBadge";
import { formatCents } from "@/lib/ecommerce/format";
import { adminApi } from "@/lib/adminApi";
import type { OrderItemRecord, OrderRecord, OrderStatus } from "@/lib/ecommerce/types";

const NEXT_STATUS_OPTIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["paid", "cancelled"],
  paid: ["in_production", "cancelled"],
  in_production: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  refunded: [],
};

function AdminOrderDetailContent() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function load() {
    const res = await adminApi.getOrder(params.id);
    setOrder(res.order);
    setItems(res.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading || !order) return <DashboardSkeleton />;

  const options = NEXT_STATUS_OPTIONS[order.status];
  const canRefund = order.status !== "refunded" && order.status !== "cancelled" && order.status !== "pending_payment";

  async function applyStatus() {
    if (!nextStatus) return;
    setBusy(true);
    setActionError("");
    try {
      await adminApi.updateStatus(order!.id, { status: nextStatus, note, trackingNumber: trackingNumber || undefined, carrier: carrier || undefined });
      setNote("");
      setNextStatus("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not update status.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRefund() {
    if (!confirm("Refund this order? This will call the payment provider's refund API.")) return;
    setBusy(true);
    setActionError("");
    try {
      await adminApi.refund(order!.id);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not refund order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-xl text-foreground">{order.orderNumber}</h1>
          <p className="text-sm text-muted">{order.shippingAddress.fullName} · {order.shippingAddress.phone}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {actionError && <p className="rounded-lg bg-danger/10 p-3 text-sm text-danger">{actionError}</p>}

      <Card>
        <p className="mb-2 text-sm font-medium text-foreground">Shipping Address</p>
        <p className="text-sm text-muted">
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}, {order.shippingAddress.city}, {order.shippingAddress.country} {order.shippingAddress.postalCode}
        </p>
      </Card>

      <Card>
        <p className="mb-2 text-sm font-medium text-foreground">Items</p>
        {items.map((item) => (
          <div key={item.id} className="flex justify-between border-b border-border py-2 text-sm last:border-0">
            <div>
              <p className="text-foreground">
                {item.productTitle} ({item.variantLabel}) × {item.quantity}
              </p>
              {item.designSnapshot && item.designSnapshot.length > 0 && (
                <p className="text-xs text-primary">Design: {item.designSnapshot.map((e) => `${e.zoneId}=${e.value}`).join(", ")}</p>
              )}
            </div>
            <span className="text-muted">{formatCents(item.lineTotalCents)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-heading text-base text-foreground">
          <span>Total</span>
          <span>{formatCents(order.totalCents)}</span>
        </div>
      </Card>

      {options.length > 0 && (
        <Card>
          <p className="mb-2 text-sm font-medium text-foreground">Update Status</p>
          <div className="flex flex-col gap-2">
            <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value as OrderStatus)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Select next status...</option>
              {options.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {nextStatus === "shipped" && (
              <div className="grid grid-cols-2 gap-2">
                <input value={carrier} onChange={(e) => setCarrier(e.target.value)} placeholder="Carrier" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
              </div>
            )}
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button disabled={!nextStatus || busy} onClick={applyStatus} className="self-start rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
              Apply
            </button>
          </div>
        </Card>
      )}

      {canRefund && (
        <button disabled={busy} onClick={handleRefund} className="self-start rounded-pill border border-danger px-4 py-2 text-sm font-medium text-danger disabled:opacity-50">
          Refund Order
        </button>
      )}

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
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { checking } = useAdminGuard("orders");
  if (checking) return <DashboardSkeleton />;
  return <AdminOrderDetailContent />;
}
