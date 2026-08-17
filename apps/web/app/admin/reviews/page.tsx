"use client";

import { useEffect, useState } from "react";
import { Star, Trash2 } from "lucide-react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { Review } from "@/lib/ecommerce/types";

const STATUS_COLOR: Record<Review["status"], string> = {
  pending: "bg-accent/10 text-accent",
  approved: "bg-primary/10 text-primary",
  rejected: "bg-danger/10 text-danger",
};

function AdminReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Review["status"] | "all">("pending");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await adminApi.listReviews();
    setReviews(res.reviews);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function moderate(id: string, status: "approved" | "rejected") {
    await adminApi.moderateReview(id, status);
    await load();
  }
  async function remove(id: string) {
    if (!confirm("Delete this review?")) return;
    await adminApi.deleteReview(id);
    await load();
  }

  if (loading) return <DashboardSkeleton />;

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Reviews</h1>

      <div className="flex gap-2">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-pill border px-3 py-1 text-xs capitalize ${filter === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No reviews here" description="Reviews matching this filter will appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={13} className={n <= r.rating ? "fill-accent text-accent" : "text-border"} />
                    ))}
                  </div>
                  <p className="text-sm text-foreground">{r.comment}</p>
                  <p className="mt-1 text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
                <span className={`shrink-0 rounded-pill px-2.5 py-1 text-xs font-medium ${STATUS_COLOR[r.status]}`}>{r.status}</span>
              </div>
              <div className="mt-2 flex gap-2">
                {r.status !== "approved" && (
                  <button onClick={() => moderate(r.id, "approved")} className="rounded-pill bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Approve</button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => moderate(r.id, "rejected")} className="rounded-pill border border-danger px-3 py-1 text-xs font-medium text-danger">Reject</button>
                )}
                <button onClick={() => remove(r.id)} className="ml-auto text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { checking } = useAdminGuard("reviews");
  if (checking) return <DashboardSkeleton />;
  return <AdminReviewsContent />;
}
