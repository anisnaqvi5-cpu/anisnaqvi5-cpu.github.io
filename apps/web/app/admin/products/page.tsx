"use client";

import { useEffect, useState } from "react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { formatCents } from "@/lib/ecommerce/format";
import { adminApi } from "@/lib/adminApi";
import type { Category, Product } from "@/lib/ecommerce/types";
import { ProductEditor } from "@/components/admin/ProductEditor";

function AdminProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);

  async function load() {
    setLoading(true);
    const [p, c] = await Promise.all([adminApi.listProducts(), adminApi.listCategories()]);
    setProducts(p.products);
    setCategories(c.categories);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const editingProduct = editingId && editingId !== "new" ? products.find((p) => p.id === editingId) ?? null : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl text-foreground">Products</h1>
        <button onClick={() => setEditingId("new")} className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          + Add Product
        </button>
      </div>

      {(editingId === "new" || editingProduct) && (
        <ProductEditor
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingId(null)}
          onSaved={async () => {
            setEditingId(null);
            await load();
          }}
        />
      )}

      <div className="flex flex-col gap-2">
        {products.map((p) => {
          const category = categories.find((c) => c.id === p.categoryId);
          const totalStock = p.variants.reduce((sum, v) => sum + v.stockQty, 0);
          return (
            <Card key={p.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.images[0]}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.title.en}</p>
                  <p className="text-xs text-muted">
                    {category?.name.en ?? "—"} · {p.variants.length} variant{p.variants.length === 1 ? "" : "s"} · {totalStock} in stock
                    {p.isPersonalizable && " · Personalizable"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-foreground">{formatCents(p.basePriceCents)}</span>
                <button onClick={() => setEditingId(p.id)} className="rounded-pill border border-border px-3 py-1 text-xs text-foreground hover:bg-primary/5">
                  Edit
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminProductsPage() {
  const { checking } = useAdminGuard("products");
  if (checking) return <DashboardSkeleton />;
  return <AdminProductsContent />;
}
