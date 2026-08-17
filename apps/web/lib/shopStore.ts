"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, DesignElement, SavedDesign, WishlistItem } from "@/lib/ecommerce/types";

// Client-local shop state: browsing/cart/wishlist/design-drafts. Unlike
// orders and payments (server-authoritative — see lib/server/orderService.ts
// and ECOMMERCE_SYSTEM.md), none of this needs to be trusted for money, so it
// lives in the browser exactly like the wellness modules do.

interface ShopState {
  customerId: string;

  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  wishlist: WishlistItem[];
  toggleWishlist: (productId: string) => void;

  designs: SavedDesign[];
  saveDesign: (productId: string, name: string, elements: DesignElement[]) => SavedDesign;
  updateDesign: (designId: string, elements: DesignElement[]) => void;

  checkoutIdempotencyKey: string | null;
  startCheckout: () => string;
  clearCheckout: () => void;
}

function newId() {
  return crypto.randomUUID();
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      customerId: newId(),

      cartItems: [],
      addToCart: (item) =>
        set((state) => {
          // Personalized items (with a designId) always get their own line —
          // two different designs on the same variant must never merge.
          const existing = !item.designId
            ? state.cartItems.find((c) => c.variantId === item.variantId && !c.designId)
            : undefined;
          if (existing) {
            return {
              cartItems: state.cartItems.map((c) => (c.id === existing.id ? { ...c, quantity: c.quantity + item.quantity } : c)),
            };
          }
          return { cartItems: [...state.cartItems, { ...item, id: newId() }] };
        }),
      updateQuantity: (cartItemId, quantity) =>
        set((state) => ({
          cartItems: quantity <= 0 ? state.cartItems.filter((c) => c.id !== cartItemId) : state.cartItems.map((c) => (c.id === cartItemId ? { ...c, quantity } : c)),
        })),
      removeFromCart: (cartItemId) => set((state) => ({ cartItems: state.cartItems.filter((c) => c.id !== cartItemId) })),
      clearCart: () => set({ cartItems: [] }),

      wishlist: [],
      toggleWishlist: (productId) =>
        set((state) => {
          const exists = state.wishlist.some((w) => w.productId === productId);
          return {
            wishlist: exists ? state.wishlist.filter((w) => w.productId !== productId) : [...state.wishlist, { productId, addedAt: new Date().toISOString() }],
          };
        }),

      designs: [],
      saveDesign: (productId, name, elements) => {
        const design: SavedDesign = { id: newId(), productId, name, elements, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        set((state) => ({ designs: [...state.designs, design] }));
        return design;
      },
      updateDesign: (designId, elements) =>
        set((state) => ({
          designs: state.designs.map((d) => (d.id === designId ? { ...d, elements, updatedAt: new Date().toISOString() } : d)),
        })),

      checkoutIdempotencyKey: null,
      startCheckout: () => {
        const existing = get().checkoutIdempotencyKey;
        if (existing) return existing;
        const key = newId();
        set({ checkoutIdempotencyKey: key });
        return key;
      },
      clearCheckout: () => set({ checkoutIdempotencyKey: null }),
    }),
    { name: "shop-app-store", version: 1 }
  )
);

export function getDesign(designs: SavedDesign[], designId?: string): SavedDesign | undefined {
  return designId ? designs.find((d) => d.id === designId) : undefined;
}
