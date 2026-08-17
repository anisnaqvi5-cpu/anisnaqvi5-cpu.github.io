"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";

export default function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await adminApi.login(passcode);
      router.push("/admin/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <Card>
        <h1 className="mb-1 font-heading text-xl text-foreground">Admin Access</h1>
        <p className="mb-4 text-sm text-muted">Enter the admin passcode to manage orders.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <button disabled={submitting} className="rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {submitting ? "Checking..." : "Sign In"}
          </button>
        </form>
        <p className="mt-3 text-xs text-muted">Demo passcode: wellness-admin-demo (or ADMIN_PASSCODE env var).</p>
      </Card>
    </div>
  );
}
