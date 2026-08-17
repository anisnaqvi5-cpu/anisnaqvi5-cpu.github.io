"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { formatCents } from "@/lib/ecommerce/format";
import { adminApi } from "@/lib/adminApi";
import type { CustomerSummary } from "@/lib/ecommerce/types";

function AdminCustomersContent() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listCustomers().then((r) => setCustomers(r.customers)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Customers</h1>
      {customers.length === 0 ? (
        <EmptyState title="No customers yet" description="Customers appear here once they place an order." />
      ) : (
        <div className="flex flex-col gap-2">
          {customers.map((c) => (
            <Card key={c.customerId} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Customer {c.customerId.slice(0, 8)}…</p>
                <p className="text-xs text-muted">
                  {c.orderCount} order{c.orderCount === 1 ? "" : "s"} · first {new Date(c.firstOrderAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">{formatCents(c.totalSpentCents)}</span>
                {c.isReturning && <span className="rounded-pill bg-primary/10 px-2 py-0.5 text-xs text-primary">Returning</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminCustomersPage() {
  const { checking } = useAdminGuard("customers");
  if (checking) return <DashboardSkeleton />;
  return <AdminCustomersContent />;
}
