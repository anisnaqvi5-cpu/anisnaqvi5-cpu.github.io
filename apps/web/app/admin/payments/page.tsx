"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { formatCents } from "@/lib/ecommerce/format";
import { adminApi } from "@/lib/adminApi";
import type { PaymentRecord } from "@/lib/ecommerce/types";

const STATUS_COLOR: Record<PaymentRecord["status"], string> = {
  pending: "bg-muted/10 text-muted",
  succeeded: "bg-primary/10 text-primary",
  failed: "bg-danger/10 text-danger",
  refunded: "bg-danger/10 text-danger",
};

function AdminPaymentsContent() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listPayments().then((r) => setPayments(r.payments)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Payments</h1>
      {payments.length === 0 ? (
        <EmptyState title="No payments yet" description="Payment attempts appear here as customers check out." />
      ) : (
        <div className="flex flex-col gap-2">
          {payments.map((p) => (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{p.providerRef}</p>
                <p className="text-xs text-muted">
                  {p.provider} · {new Date(p.createdAt).toLocaleString()}
                  {p.failureReason && ` · ${p.failureReason}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">{formatCents(p.amountCents)}</span>
                <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[p.status]}`}>{p.status}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const { checking } = useAdminGuard("payments");
  if (checking) return <DashboardSkeleton />;
  return <AdminPaymentsContent />;
}
