"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { Category, Product } from "@/lib/ecommerce/types";
import { CATEGORIES as SEED_CATEGORIES, PRODUCTS as SEED_PRODUCTS } from "@/lib/ecommerce/catalog";

// Live catalog fetched from /api/shop/catalog (the admin-managed source of
// truth — see ADMIN_DASHBOARD.md), with the static seed as an instant
// fallback so pages render immediately instead of blank while loading.
interface CatalogState {
  products: Product[];
  categories: Category[];
  loaded: boolean;
  fetchCatalog: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: SEED_PRODUCTS,
  categories: SEED_CATEGORIES,
  loaded: false,
  fetchCatalog: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/shop/catalog");
      if (!res.ok) return;
      const data = await res.json();
      set({ products: data.products, categories: data.categories, loaded: true });
    } catch {
      // keep the seed fallback
    }
  },
}));

export function useEnsureCatalog() {
  const fetchCatalog = useCatalogStore((s) => s.fetchCatalog);
  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);
}
