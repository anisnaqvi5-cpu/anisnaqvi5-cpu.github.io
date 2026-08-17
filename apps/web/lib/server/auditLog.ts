import crypto from "node:crypto";
import type { AdminUserRecord } from "@/lib/ecommerce/types";
import { withDb, readDb } from "@/lib/server/db";

/** Every mutating admin action calls this — it's the record of "who did what,
 * to what, when" that ADMIN_DASHBOARD.md's security section requires. */
export async function logAudit(admin: AdminUserRecord, action: string, entityType: string, entityId: string, note?: string): Promise<void> {
  await withDb((db) => {
    db.auditLogs.unshift({
      id: crypto.randomUUID(),
      adminUserId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action,
      entityType,
      entityId,
      note,
      createdAt: new Date().toISOString(),
    });
    // Bound the log so the JSON file doesn't grow unbounded in this demo store.
    if (db.auditLogs.length > 2000) db.auditLogs.length = 2000;
  });
}

export function listAuditLogs(limit = 200) {
  return readDb((db) => db.auditLogs.slice(0, limit));
}
