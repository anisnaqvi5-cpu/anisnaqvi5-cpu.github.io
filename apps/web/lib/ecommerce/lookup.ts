import type { Product, ProductVariant } from "@/lib/ecommerce/types";

// Pure list-based lookups usable with either the static seed catalog or a
// live-fetched product list (see lib/useCatalogStore.ts) — same shape either way.
export function findVariantInList(products: Product[], productId: string, variantId: string): { product: Product; variant: ProductVariant } | undefined {
  const product = products.find((p) => p.id === productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) return undefined;
  return { product, variant };
}

export function findProductByVariantIdInList(products: Product[], variantId: string): { product: Product; variant: ProductVariant } | undefined {
  for (const product of products) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return undefined;
}
