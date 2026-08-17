"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { ProductCard } from "@/components/shop/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/lib/ecommerce/catalog";
import { useWellnessStore } from "@/lib/store";

function ShopHomeContent() {
  const locale = useWellnessStore((s) => s.locale);
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/shop/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Personalized wellness, delivered</h1>
        <p className="text-sm text-muted">Six categories of products you can make truly yours.</p>
      </div>

      <form onSubmit={submitSearch} className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2">
          <Search size={16} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent text-sm text-foreground outline-none"
          />
        </div>
        <button type="submit" className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Search
        </button>
      </form>

      <div>
        <h2 className="mb-3 font-heading text-lg text-foreground">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/products?category=${cat.slug}`}
              className="rounded-card border border-border bg-surface p-4 text-center transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <p className="text-sm font-medium text-foreground">{cat.name[locale]}</p>
              <p className="mt-1 text-xs text-muted">{cat.tagline[locale]}</p>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg text-foreground">Featured Products</h2>
          <Link href="/shop/products" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PRODUCTS.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopHomePage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <ShopHomeContent />
    </ClientOnly>
  );
}
