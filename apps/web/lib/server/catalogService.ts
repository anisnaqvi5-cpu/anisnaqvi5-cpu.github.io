import crypto from "node:crypto";
import type { Category, Coupon, Product, ProductVariant } from "@/lib/ecommerce/types";
import { readDb, withDb } from "@/lib/server/db";
import { OrderError } from "@/lib/server/errors";

export const SHIPPING_FEE_CENTS = 500;

// ---- Public reads (live catalog — what the shop actually serves) ----------
export function listProducts(): Product[] {
  return readDb((db) => db.products);
}

export function listCategories(): Category[] {
  return readDb((db) => db.categories);
}

export function listActiveCoupons(): Coupon[] {
  return readDb((db) => db.coupons.filter((c) => c.isActive));
}

export function findProduct(productId: string): Product | undefined {
  return readDb((db) => db.products.find((p) => p.id === productId));
}

export function findProductBySlug(slug: string): Product | undefined {
  return readDb((db) => db.products.find((p) => p.slug === slug));
}

export function findVariant(productId: string, variantId: string): { product: Product; variant: ProductVariant } | undefined {
  const product = findProduct(productId);
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) return undefined;
  return { product, variant };
}

export function findProductByVariantId(variantId: string): { product: Product; variant: ProductVariant } | undefined {
  return readDb((db) => {
    for (const product of db.products) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) return { product, variant };
    }
    return undefined;
  });
}

export function findCoupon(code: string): Coupon | undefined {
  return readDb((db) => db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive));
}

// ---- Admin writes (Product Manager / Super Admin) --------------------------
export async function createProduct(input: Omit<Product, "id" | "avgRating" | "reviewCount">): Promise<Product> {
  return withDb((db) => {
    if (db.products.some((p) => p.slug === input.slug)) throw new OrderError("duplicate_slug", `A product with slug "${input.slug}" already exists.`);
    const product: Product = { ...input, id: crypto.randomUUID(), avgRating: 0, reviewCount: 0 };
    db.products.push(product);
    return product;
  });
}

export async function updateProduct(id: string, patch: Partial<Omit<Product, "id">>): Promise<Product> {
  return withDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product) throw new OrderError("not_found", "Product not found.");
    Object.assign(product, patch);
    return product;
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await withDb((db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
}

export async function updateVariant(productId: string, variantId: string, patch: Partial<Omit<ProductVariant, "id">>): Promise<Product> {
  return withDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new OrderError("not_found", "Product not found.");
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) throw new OrderError("not_found", "Variant not found.");
    Object.assign(variant, patch);
    return product;
  });
}

export async function addVariant(productId: string, variant: Omit<ProductVariant, "id">): Promise<Product> {
  return withDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new OrderError("not_found", "Product not found.");
    product.variants.push({ ...variant, id: crypto.randomUUID() });
    return product;
  });
}

export async function removeVariant(productId: string, variantId: string): Promise<Product> {
  return withDb((db) => {
    const product = db.products.find((p) => p.id === productId);
    if (!product) throw new OrderError("not_found", "Product not found.");
    if (product.variants.length <= 1) throw new OrderError("last_variant", "A product must have at least one variant.");
    product.variants = product.variants.filter((v) => v.id !== variantId);
    return product;
  });
}

export async function createCategory(input: Omit<Category, "id">): Promise<Category> {
  return withDb((db) => {
    if (db.categories.some((c) => c.slug === input.slug)) throw new OrderError("duplicate_slug", `Category slug "${input.slug}" already exists.`);
    const category: Category = { ...input, id: crypto.randomUUID() };
    db.categories.push(category);
    return category;
  });
}

export async function updateCategory(id: string, patch: Partial<Omit<Category, "id">>): Promise<Category> {
  return withDb((db) => {
    const category = db.categories.find((c) => c.id === id);
    if (!category) throw new OrderError("not_found", "Category not found.");
    Object.assign(category, patch);
    return category;
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await withDb((db) => {
    if (db.products.some((p) => p.categoryId === id)) throw new OrderError("category_in_use", "Cannot delete a category that still has products.");
    db.categories = db.categories.filter((c) => c.id !== id);
  });
}

export async function createCoupon(input: Omit<Coupon, "isActive">): Promise<Coupon> {
  return withDb((db) => {
    if (db.coupons.some((c) => c.code.toUpperCase() === input.code.toUpperCase())) throw new OrderError("duplicate_code", "That coupon code already exists.");
    const coupon: Coupon = { ...input, isActive: true };
    db.coupons.push(coupon);
    return coupon;
  });
}

export async function updateCoupon(code: string, patch: Partial<Omit<Coupon, "code">>): Promise<Coupon> {
  return withDb((db) => {
    const coupon = db.coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) throw new OrderError("not_found", "Coupon not found.");
    Object.assign(coupon, patch);
    return coupon;
  });
}

export async function deleteCoupon(code: string): Promise<void> {
  await withDb((db) => {
    db.coupons = db.coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  });
}
