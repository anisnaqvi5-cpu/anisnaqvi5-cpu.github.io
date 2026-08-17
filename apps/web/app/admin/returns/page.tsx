"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { ReturnRequest } from "@/lib/ecommerce/types";

const STATUS_COLOR: Record<string, string> = {
  requested: "bg-accent/10 text-accent",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-danger/10 text-danger",
  refunded: "bg-primary/20 text-primary",
};

function AdminReturnsContent() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await adminApi.listReturns();
    setReturns(res.returns);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function resolve(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await adminApi.resolveReturn(id, action);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Return Requests</h1>
      {returns.length === 0 ? (
        <EmptyState title="No return requests" description="Customer return requests will appear here for review." />
      ) : (
        <div className="flex flex-col gap-3">
          {returns.map((r) => (
            <Card key={r.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Order item: {r.orderItemId.slice(0, 8)}…</p>
                <p className="text-xs text-muted">Reason: {r.reason}</p>
                <p className="text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                {r.status === "requested" && (
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === r.id}
                      onClick={() => resolve(r.id, "approve")}
                      className="rounded-pill bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
                    >
                      Approve & Refund
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => resolve(r.id, "reject")}
                      className="rounded-pill border border-danger px-3 py-1 text-xs font-medium text-danger disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReturnsPage() {
  const { checking } = useAdminGuard();
  if (checking) return <DashboardSkeleton />;
  return <AdminReturnsContent />;
}
