"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { NotificationBroadcast } from "@/lib/ecommerce/types";

function AdminNotificationsContent() {
  const [broadcasts, setBroadcasts] = useState<NotificationBroadcast[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<NotificationBroadcast["audience"]>("all_customers");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const res = await adminApi.listBroadcasts();
    setBroadcasts(res.broadcasts);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !body) return;
    setSending(true);
    try {
      await adminApi.sendBroadcast({ title, body, audience });
      setTitle("");
      setBody("");
      await load();
    } finally {
      setSending(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Notifications</h1>

      <Card>
        <p className="mb-1 text-sm font-medium text-foreground">Compose Broadcast</p>
        <p className="mb-3 text-xs text-muted">
          No push infrastructure is wired up yet (see ADMIN_DASHBOARD.md) — this logs the broadcast and estimates reach from real customer counts, rather than pretending to deliver a push.
        </p>
        <form onSubmit={send} className="flex flex-col gap-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" rows={2} className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={audience} onChange={(e) => setAudience(e.target.value as NotificationBroadcast["audience"])} className="self-start rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option value="all_customers">All customers</option>
            <option value="recent_customers">Returning customers</option>
          </select>
          <button disabled={sending} className="self-start rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {sending ? "Sending..." : "Send Broadcast"}
          </button>
        </form>
      </Card>

      {broadcasts.length === 0 ? (
        <EmptyState title="No broadcasts sent yet" description="Sent broadcasts appear here." />
      ) : (
        <div className="flex flex-col gap-2">
          {broadcasts.map((b) => (
            <Card key={b.id}>
              <p className="text-sm font-medium text-foreground">{b.title}</p>
              <p className="text-sm text-muted">{b.body}</p>
              <p className="mt-1 text-xs text-muted">
                {b.audience === "all_customers" ? "All customers" : "Returning customers"} · ~{b.recipientCountEstimate} recipients · {new Date(b.createdAt).toLocaleString()} · by {b.sentBy}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminNotificationsPage() {
  const { checking } = useAdminGuard("notifications");
  if (checking) return <DashboardSkeleton />;
  return <AdminNotificationsContent />;
}
