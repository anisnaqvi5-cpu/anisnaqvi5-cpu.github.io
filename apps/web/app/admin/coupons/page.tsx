"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { Coupon } from "@/lib/ecommerce/types";

function AdminCouponsContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [type, setType] = useState<Coupon["type"]>("percentage");
  const [value, setValue] = useState("10");
  const [minOrder, setMinOrder] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await adminApi.listCoupons();
    setCoupons(res.coupons);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await adminApi.createCoupon({
        code: code.toUpperCase(),
        type,
        value: type === "fixed_amount" ? Math.round(Number(value) * 100) : Number(value),
        minOrderCents: minOrder ? Math.round(Number(minOrder) * 100) : undefined,
      });
      setCode("");
      setValue("10");
      setMinOrder("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create coupon.");
    }
  }

  async function toggle(c: Coupon) {
    await adminApi.updateCoupon(c.code, { isActive: !c.isActive });
    await load();
  }

  async function remove(code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    await adminApi.deleteCoupon(code);
    await load();
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Coupons</h1>

      <Card>
        <p className="mb-2 text-sm font-medium text-foreground">Create Coupon</p>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Code
            <input value={code} onChange={(e) => setCode(e.target.value)} required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Type
            <select value={type} onChange={(e) => setType(e.target.value as Coupon["type"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="percentage">Percentage</option>
              <option value="fixed_amount">Fixed amount ($)</option>
              <option value="free_shipping">Free shipping</option>
            </select>
          </label>
          {type !== "free_shipping" && (
            <label className="flex flex-col gap-1 text-xs text-muted">
              {type === "percentage" ? "Percent off" : "Amount ($)"}
              <input value={value} onChange={(e) => setValue(e.target.value)} className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            </label>
          )}
          <label className="flex flex-col gap-1 text-xs text-muted">
            Min order ($, optional)
            <input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className="w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <button className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
        </form>
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      </Card>

      <div className="flex flex-col gap-2">
        {coupons.map((c) => (
          <Card key={c.code} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{c.code}</p>
              <p className="text-xs text-muted">
                {c.type === "percentage" && `${c.value}% off`}
                {c.type === "fixed_amount" && `$${(c.value / 100).toFixed(2)} off`}
                {c.type === "free_shipping" && "Free shipping"}
                {c.minOrderCents ? ` · min $${(c.minOrderCents / 100).toFixed(2)}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => toggle(c)} className={`rounded-pill px-2.5 py-1 text-xs ${c.isActive ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"}`}>
                {c.isActive ? "Active" : "Inactive"}
              </button>
              <button onClick={() => remove(c.code)} className="text-muted hover:text-danger"><Trash2 size={16} /></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminCouponsPage() {
  const { checking } = useAdminGuard("coupons");
  if (checking) return <DashboardSkeleton />;
  return <AdminCouponsContent />;
}
