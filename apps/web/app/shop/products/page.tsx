"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { ProductCard } from "@/components/shop/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/ecommerce/catalog";
import { useWellnessStore } from "@/lib/store";

type SortKey = "popularity" | "price_asc" | "price_desc";

function ProductListingContent() {
  const locale = useWellnessStore((s) => s.locale);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") ?? "all";
  const initialQuery = searchParams.get("q") ?? "";

  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [personalizableOnly, setPersonalizableOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("popularity");

  const results = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      const cat = CATEGORIES.find((c) => c.id === p.categoryId);
      if (category !== "all" && cat?.slug !== category) return false;
      if (personalizableOnly && !p.isPersonalizable) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${p.title.en} ${p.description.en} ${p.title.ar} ${p.description.ar}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price_asc") return a.basePriceCents - b.basePriceCents;
      if (sort === "price_desc") return b.basePriceCents - a.basePriceCents;
      return b.reviewCount - a.reviewCount;
    });
    return list;
  }, [category, personalizableOnly, query, sort]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-foreground">All Products</h1>
        <p className="text-sm text-muted">{results.length} product{results.length === 1 ? "" : "s"} found</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`rounded-pill border px-3 py-1 text-xs ${category === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`rounded-pill border px-3 py-1 text-xs ${category === c.slug ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}
            >
              {c.name[locale]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={personalizableOnly} onChange={(e) => setPersonalizableOnly(e.target.checked)} />
            Personalizable only
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground">
            <option value="popularity">Sort: Popularity</option>
            <option value="price_asc">Sort: Price low to high</option>
            <option value="price_desc">Sort: Price high to low</option>
          </select>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState title="No products found" description="Try clearing filters or searching a different term." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductListingPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <Suspense fallback={<DashboardSkeleton />}>
        <ProductListingContent />
      </Suspense>
    </ClientOnly>
  );
}
