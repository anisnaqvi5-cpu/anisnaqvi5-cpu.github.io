"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { AdminRole, AdminUserRecord } from "@/lib/ecommerce/types";
import { ROLE_LABELS } from "@/lib/server/permissions";

const ROLES: AdminRole[] = ["super_admin", "product_manager", "order_manager", "content_manager"];

function AdminUsersContent({ currentAdminId }: { currentAdminId: string }) {
  const [users, setUsers] = useState<Omit<AdminUserRecord, "passwordHash">[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("content_manager");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await adminApi.listAdminUsers();
    setUsers(res.users);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await adminApi.createAdminUser({ email, name, password, role });
      setEmail("");
      setName("");
      setPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create admin.");
    }
  }

  async function changeRole(id: string, newRole: AdminRole) {
    await adminApi.updateAdminUser(id, { role: newRole });
    await load();
  }

  async function toggleActive(u: Omit<AdminUserRecord, "passwordHash">) {
    try {
      await adminApi.updateAdminUser(u.id, { isActive: !u.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update admin.");
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Admin Users & Roles</h1>

      <Card>
        <p className="mb-2 text-sm font-medium text-foreground">Add Admin</p>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value as AdminRole)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
        </form>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </Card>

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{u.name} {u.id === currentAdminId && <span className="text-xs text-muted">(you)</span>}</p>
              <p className="text-xs text-muted">
                {u.email} · {u.lastLoginAt ? `last login ${new Date(u.lastLoginAt).toLocaleString()}` : "never signed in"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value as AdminRole)} className="rounded-lg border border-border bg-background px-2 py-1 text-xs">
                {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
              <button
                onClick={() => toggleActive(u)}
                disabled={u.id === currentAdminId}
                className={`rounded-pill px-2.5 py-1 text-xs disabled:opacity-40 ${u.isActive ? "bg-primary/10 text-primary" : "bg-danger/10 text-danger"}`}
              >
                {u.isActive ? "Active" : "Deactivated"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { checking, admin } = useAdminGuard("admin_users");
  if (checking || !admin) return <DashboardSkeleton />;
  return <AdminUsersContent currentAdminId={admin.id} />;
}
