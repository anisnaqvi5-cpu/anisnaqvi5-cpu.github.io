import type { OrderStatus } from "@/lib/ecommerce/types";

const LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  paid: "Paid",
  in_production: "In Production",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const COLORS: Record<OrderStatus, string> = {
  pending_payment: "bg-muted/10 text-muted",
  paid: "bg-primary/10 text-primary",
  in_production: "bg-accent/10 text-accent",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-primary/20 text-primary",
  cancelled: "bg-danger/10 text-danger",
  refunded: "bg-danger/10 text-danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex rounded-pill px-2.5 py-1 text-xs font-medium ${COLORS[status]}`}>{LABELS[status]}</span>;
}

export const ORDER_STATUS_LABELS = LABELS;
