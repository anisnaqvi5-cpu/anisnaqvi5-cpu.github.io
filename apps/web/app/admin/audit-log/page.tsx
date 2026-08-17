"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { AuditLogEntry } from "@/lib/ecommerce/types";
import { ROLE_LABELS } from "@/lib/server/permissions";

function AdminAuditLogContent() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listAuditLogs().then((r) => setLogs(r.logs)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Audit Log</h1>
        <p className="text-sm text-muted">Every mutating admin action — who, what, when.</p>
      </div>
      {logs.length === 0 ? (
        <EmptyState title="No admin actions logged yet" description="Actions taken across the dashboard will appear here." />
      ) : (
        <div className="flex flex-col gap-1.5">
          {logs.map((l) => (
            <Card key={l.id} className="py-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{l.action}</span>
                <span className="text-xs text-muted">{new Date(l.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted">
                {l.adminEmail} ({ROLE_LABELS[l.adminRole]}) · {l.entityType} {l.entityId.slice(0, 12)}
                {l.note ? ` · ${l.note}` : ""}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminAuditLogPage() {
  const { checking } = useAdminGuard("audit_log");
  if (checking) return <DashboardSkeleton />;
  return <AdminAuditLogContent />;
}
