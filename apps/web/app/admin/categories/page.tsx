"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { Category } from "@/lib/ecommerce/types";

function AdminCategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [taglineAr, setTaglineAr] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await adminApi.listCategories();
    setCategories(res.categories);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await adminApi.createCategory({ slug, name: { en: nameEn, ar: nameAr }, tagline: { en: taglineEn, ar: taglineAr } });
      setNameEn("");
      setNameAr("");
      setTaglineEn("");
      setTaglineAr("");
      setSlug("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category?")) return;
    try {
      await adminApi.deleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete category.");
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Categories</h1>

      <Card>
        <p className="mb-2 text-sm font-medium text-foreground">Add Category</p>
        <form onSubmit={handleCreate} className="grid gap-2 sm:grid-cols-2">
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Name (English)" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input dir="auto" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="Name (Arabic)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} placeholder="Tagline (English)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input dir="auto" value={taglineAr} onChange={(e) => setTaglineAr(e.target.value)} placeholder="Tagline (Arabic)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-slug" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
          <button className="self-start rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground sm:col-span-2">Add</button>
        </form>
      </Card>

      <div className="flex flex-col gap-2">
        {categories.map((c) => (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{c.name.en}</p>
              <p className="text-xs text-muted">{c.slug} · {c.tagline.en}</p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-muted hover:text-danger"><Trash2 size={16} /></button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminCategoriesPage() {
  const { checking } = useAdminGuard("categories");
  if (checking) return <DashboardSkeleton />;
  return <AdminCategoriesContent />;
}
