"use client";

import { useShopStore } from "@/lib/shopStore";
import type { Address, CreateOrderRequest, OrderItemInput } from "@/lib/ecommerce/types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const customerId = useShopStore.getState().customerId;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Customer-Id": customerId, ...init?.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data as T;
}

export const shopApi = {
  previewTotals: (items: OrderItemInput[], couponCode?: string) =>
    request<{ subtotalCents: number; discountCents: number; shippingFeeCents: number; totalCents: number; couponCode: string | null }>(
      "/api/checkout/preview-totals",
      { method: "POST", body: JSON.stringify({ items, couponCode }) }
    ),

  createOrder: (body: CreateOrderRequest) =>
    request<{ order: import("@/lib/ecommerce/types").OrderRecord; clientSecret: string; provider: "stripe" | "mock" }>("/api/checkout/create-order", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  simulatePayment: (paymentIntentId: string, outcome: "succeed" | "decline") =>
    request<{ ok: true }>("/api/checkout/simulate-payment", { method: "POST", body: JSON.stringify({ paymentIntentId, outcome }) }),

  listOrders: () => request<{ orders: import("@/lib/ecommerce/types").OrderRecord[] }>("/api/orders"),

  getOrder: (id: string) =>
    request<{ order: import("@/lib/ecommerce/types").OrderRecord; items: import("@/lib/ecommerce/types").OrderItemRecord[] }>(`/api/orders/${id}`),

  cancelOrder: (id: string) => request<{ order: import("@/lib/ecommerce/types").OrderRecord }>(`/api/orders/${id}/cancel`, { method: "POST" }),

  requestReturn: (id: string, orderItemId: string, reason: string) =>
    request<{ request: unknown }>(`/api/orders/${id}/return`, { method: "POST", body: JSON.stringify({ orderItemId, reason }) }),

  listReviews: (productId: string) => request<{ reviews: import("@/lib/ecommerce/types").Review[] }>(`/api/reviews?productId=${productId}`),

  createReview: (body: { productId: string; orderItemId: string; rating: 1 | 2 | 3 | 4 | 5; comment: string }) =>
    request<{ review: unknown }>("/api/reviews", { method: "POST", body: JSON.stringify(body) }),
};

export type { Address };
