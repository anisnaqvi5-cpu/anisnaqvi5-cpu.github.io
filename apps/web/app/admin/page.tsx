"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { formatCents } from "@/lib/ecommerce/format";
import { adminApi } from "@/lib/adminApi";
import type { DashboardMetrics } from "@/lib/server/analyticsService";

const RANGE_OPTIONS = [
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 36500, label: "All time" },
];

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="text-center">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-heading text-xl text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted">{sub}</p>}
    </Card>
  );
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export default function AdminDashboardPage() {
  const { checking } = useAdminGuard("dashboard");
  const [range, setRange] = useState(30);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checking) return;
    setLoading(true);
    adminApi.getAnalytics(range).then(setMetrics).finally(() => setLoading(false));
  }, [checking, range]);

  if (checking || loading || !metrics) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">Dashboard</h1>
        <div className="flex gap-1 rounded-pill border border-border p-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r.days}
              onClick={() => setRange(r.days)}
              className={`rounded-pill px-3 py-1 text-xs transition ${range === r.days ? "bg-primary text-primary-foreground" : "text-muted"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Revenue" value={formatCents(metrics.revenueCents)} sub={metrics.refundedCents > 0 ? `−${formatCents(metrics.refundedCents)} refunded` : undefined} />
        <StatTile label="Orders" value={String(metrics.orderCount)} />
        <StatTile label="Avg Order Value" value={formatCents(metrics.averageOrderValueCents)} />
        <StatTile label="Net Revenue" value={formatCents(metrics.netRevenueCents)} />
        <StatTile label="New Customers" value={String(metrics.newCustomers)} />
        <StatTile label="Returning Customers" value={String(metrics.returningCustomers)} sub={`of ${metrics.totalCustomers} total`} />
        <StatTile label="Personalization Rate" value={pct(metrics.personalizationRate)} sub={`${metrics.personalizedItemCount}/${metrics.totalItemCount} items`} />
        <StatTile label="Payment Success" value={pct(metrics.paymentSuccessRate)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-heading text-base text-foreground">Best-Selling Products</h2>
          {metrics.bestSellers.length === 0 ? (
            <p className="text-sm text-muted">No sales in this period yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {metrics.bestSellers.map((b) => (
                <li key={b.productId} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{b.title}</span>
                  <span className="text-muted">
                    {b.unitsSold} units · {formatCents(b.revenueCents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-base text-foreground">Popular Customizations</h2>
          {metrics.topColors.length === 0 ? (
            <p className="text-sm text-muted">No personalized colors chosen yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {metrics.topColors.map((c) => (
                <div key={c.hex} className="flex items-center gap-2 rounded-pill border border-border px-2.5 py-1 text-xs">
                  <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                  {c.hex} × {c.count}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-base text-foreground">Conversion Metrics</h2>
          <ul className="flex flex-col gap-2 text-sm">
            <li className="flex justify-between"><span className="text-muted">Payment success rate</span><span className="text-foreground">{pct(metrics.paymentSuccessRate)}</span></li>
            <li className="flex justify-between"><span className="text-muted">Cancellation rate</span><span className="text-foreground">{pct(metrics.cancellationRate)}</span></li>
            <li className="flex justify-between"><span className="text-muted">Return rate</span><span className="text-foreground">{pct(metrics.returnRate)}</span></li>
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            No storefront visitor-traffic tracking exists yet, so these are real order/payment-outcome rates rather than a fabricated visitor→purchase conversion rate.
          </p>
        </Card>

        <Card>
          <h2 className="mb-3 font-heading text-base text-foreground">Orders by Status</h2>
          <ul className="flex flex-col gap-1.5 text-sm">
            {Object.entries(metrics.ordersByStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="text-muted capitalize">{status.replace(/_/g, " ")}</span>
                <span className="text-foreground">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
