"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";

const DEMO_ACCOUNTS = [
  { email: "super@wellness.demo", role: "Super Admin" },
  { email: "products@wellness.demo", role: "Product Manager" },
  { email: "orders@wellness.demo", role: "Order Manager" },
  { email: "content@wellness.demo", role: "Content Manager" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await adminApi.login(email, password);
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Card>
        <h1 className="mb-1 font-heading text-xl text-foreground">Admin Dashboard</h1>
        <p className="mb-4 text-sm text-muted">Sign in with your admin account.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button disabled={submitting} className="rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {submitting ? "Checking..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 rounded-lg border border-dashed border-border p-3 text-xs text-muted">
          <p className="mb-1 font-medium text-foreground">Demo accounts (password: wellness-admin-demo)</p>
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => {
                setEmail(a.email);
                setPassword("wellness-admin-demo");
              }}
              className="block w-full py-0.5 text-left hover:text-primary"
            >
              {a.email} — {a.role}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
