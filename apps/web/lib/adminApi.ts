"use client";

import type {
  AdminRole,
  AdminUserRecord,
  AuditLogEntry,
  Category,
  Coupon,
  CustomerSummary,
  FontRecord,
  NotificationBroadcast,
  OrderItemRecord,
  OrderRecord,
  Product,
  QuoteRecord,
  Review,
  ReturnRequest,
} from "@/lib/ecommerce/types";
import type { MindfulnessSession, Workout } from "@/lib/types";
import type { AdminSection } from "@/lib/server/permissions";
import type { GratitudePromptRecord } from "@/lib/server/db";
import type { DashboardMetrics } from "@/lib/server/analyticsService";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.error || "Request failed");
  return data as T;
}

type AdminSessionUser = { id: string; email: string; name: string; role: AdminRole };
type NoPassword<T> = Omit<T, "passwordHash">;

export const adminApi = {
  // Auth
  session: () => request<{ authed: boolean; admin?: AdminSessionUser; sections?: AdminSection[] }>("/api/admin/auth/session"),
  login: (email: string, password: string) => request<{ admin: AdminSessionUser }>("/api/admin/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: true }>("/api/admin/auth/logout", { method: "POST" }),

  // Orders
  listOrders: (status?: string) => request<{ orders: OrderRecord[] }>(`/api/admin/orders${status ? `?status=${status}` : ""}`),
  getOrder: (id: string) => request<{ order: OrderRecord; items: OrderItemRecord[] }>(`/api/admin/orders/${id}`),
  updateStatus: (id: string, body: { status: string; note?: string; trackingNumber?: string; carrier?: string }) =>
    request<{ order: OrderRecord }>(`/api/admin/orders/${id}/status`, { method: "POST", body: JSON.stringify(body) }),
  refund: (id: string) => request<{ order: OrderRecord }>(`/api/admin/orders/${id}/refund`, { method: "POST" }),

  // Returns
  listReturns: () => request<{ returns: ReturnRequest[] }>("/api/admin/returns"),
  resolveReturn: (id: string, action: "approve" | "reject") => request<{ ok: true }>(`/api/admin/returns/${id}`, { method: "POST", body: JSON.stringify({ action }) }),

  // Products / Categories / Coupons
  listProducts: () => request<{ products: Product[] }>("/api/admin/products"),
  createProduct: (body: Omit<Product, "id" | "avgRating" | "reviewCount">) => request<{ product: Product }>("/api/admin/products", { method: "POST", body: JSON.stringify(body) }),
  updateProduct: (id: string, patch: Partial<Product>) => request<{ product: Product }>(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteProduct: (id: string) => request<{ ok: true }>(`/api/admin/products/${id}`, { method: "DELETE" }),
  addVariant: (productId: string, body: { sku: string; label: string; priceDeltaCents: number; stockQty: number }) =>
    request<{ product: Product }>(`/api/admin/products/${productId}/variants`, { method: "POST", body: JSON.stringify(body) }),
  updateVariant: (productId: string, variantId: string, patch: { sku?: string; label?: string; priceDeltaCents?: number; stockQty?: number }) =>
    request<{ product: Product }>(`/api/admin/products/${productId}/variants/${variantId}`, { method: "PATCH", body: JSON.stringify(patch) }),
  removeVariant: (productId: string, variantId: string) => request<{ product: Product }>(`/api/admin/products/${productId}/variants/${variantId}`, { method: "DELETE" }),

  listCategories: () => request<{ categories: Category[] }>("/api/admin/categories"),
  createCategory: (body: Omit<Category, "id">) => request<{ category: Category }>("/api/admin/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id: string, patch: Partial<Category>) => request<{ category: Category }>(`/api/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteCategory: (id: string) => request<{ ok: true }>(`/api/admin/categories/${id}`, { method: "DELETE" }),

  listCoupons: () => request<{ coupons: Coupon[] }>("/api/admin/coupons"),
  createCoupon: (body: Omit<Coupon, "isActive">) => request<{ coupon: Coupon }>("/api/admin/coupons", { method: "POST", body: JSON.stringify(body) }),
  updateCoupon: (code: string, patch: Partial<Coupon>) => request<{ coupon: Coupon }>(`/api/admin/coupons/${code}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteCoupon: (code: string) => request<{ ok: true }>(`/api/admin/coupons/${code}`, { method: "DELETE" }),

  // Customization library
  listFonts: () => request<{ fonts: FontRecord[] }>("/api/admin/customization/fonts"),
  createFont: (body: Omit<FontRecord, "id">) => request<{ font: FontRecord }>("/api/admin/customization/fonts", { method: "POST", body: JSON.stringify(body) }),
  updateFont: (id: string, patch: Partial<FontRecord>) => request<{ font: FontRecord }>(`/api/admin/customization/fonts/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteFont: (id: string) => request<{ ok: true }>(`/api/admin/customization/fonts/${id}`, { method: "DELETE" }),

  listQuotes: () => request<{ quotes: QuoteRecord[] }>("/api/admin/customization/quotes"),
  createQuote: (body: Omit<QuoteRecord, "id">) => request<{ quote: QuoteRecord }>("/api/admin/customization/quotes", { method: "POST", body: JSON.stringify(body) }),
  updateQuote: (id: string, patch: Partial<QuoteRecord>) => request<{ quote: QuoteRecord }>(`/api/admin/customization/quotes/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteQuote: (id: string) => request<{ ok: true }>(`/api/admin/customization/quotes/${id}`, { method: "DELETE" }),

  listDesigns: () => request<{ designs: { orderItem: OrderItemRecord; orderNumber: string; orderId: string; createdAt: string }[] }>("/api/admin/designs"),

  // Customers
  listCustomers: () => request<{ customers: CustomerSummary[] }>("/api/admin/customers"),
  getCustomer: (id: string) => request<{ summary: CustomerSummary; orders: OrderRecord[] }>(`/api/admin/customers/${id}`),

  // Payments
  listPayments: () => request<{ payments: import("@/lib/ecommerce/types").PaymentRecord[] }>("/api/admin/payments"),

  // Reviews
  listReviews: () => request<{ reviews: Review[] }>("/api/admin/reviews"),
  moderateReview: (id: string, status: "approved" | "rejected") => request<{ review: Review }>(`/api/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteReview: (id: string) => request<{ ok: true }>(`/api/admin/reviews/${id}`, { method: "DELETE" }),

  // Wellness content
  listWorkouts: () => request<{ workouts: Workout[] }>("/api/admin/wellness/workouts"),
  createWorkout: (body: Omit<Workout, "id">) => request<{ workout: Workout }>("/api/admin/wellness/workouts", { method: "POST", body: JSON.stringify(body) }),
  updateWorkout: (id: string, patch: Partial<Workout>) => request<{ workout: Workout }>(`/api/admin/wellness/workouts/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteWorkout: (id: string) => request<{ ok: true }>(`/api/admin/wellness/workouts/${id}`, { method: "DELETE" }),

  listMindfulness: () => request<{ sessions: MindfulnessSession[] }>("/api/admin/wellness/mindfulness"),
  createMindfulness: (body: Omit<MindfulnessSession, "id">) => request<{ session: MindfulnessSession }>("/api/admin/wellness/mindfulness", { method: "POST", body: JSON.stringify(body) }),
  updateMindfulness: (id: string, patch: Partial<MindfulnessSession>) => request<{ session: MindfulnessSession }>(`/api/admin/wellness/mindfulness/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteMindfulness: (id: string) => request<{ ok: true }>(`/api/admin/wellness/mindfulness/${id}`, { method: "DELETE" }),

  listPrompts: () => request<{ prompts: GratitudePromptRecord[] }>("/api/admin/wellness/prompts"),
  createPrompt: (body: { text: string; textAr: string }) => request<{ prompt: GratitudePromptRecord }>("/api/admin/wellness/prompts", { method: "POST", body: JSON.stringify(body) }),
  updatePrompt: (id: string, patch: Partial<GratitudePromptRecord>) => request<{ prompt: GratitudePromptRecord }>(`/api/admin/wellness/prompts/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deletePrompt: (id: string) => request<{ ok: true }>(`/api/admin/wellness/prompts/${id}`, { method: "DELETE" }),

  // Notifications
  listBroadcasts: () => request<{ broadcasts: NotificationBroadcast[] }>("/api/admin/notifications"),
  sendBroadcast: (body: { title: string; body: string; audience: NotificationBroadcast["audience"] }) =>
    request<{ broadcast: NotificationBroadcast }>("/api/admin/notifications", { method: "POST", body: JSON.stringify(body) }),

  // Analytics
  getAnalytics: (rangeDays: number) => request<DashboardMetrics>(`/api/admin/analytics?range=${rangeDays}`),

  // Admin users & audit log (super_admin only)
  listAdminUsers: () => request<{ users: NoPassword<AdminUserRecord>[] }>("/api/admin/users"),
  createAdminUser: (body: { email: string; name: string; password: string; role: AdminRole }) =>
    request<{ user: NoPassword<AdminUserRecord> }>("/api/admin/users", { method: "POST", body: JSON.stringify(body) }),
  updateAdminUser: (id: string, patch: { role?: AdminRole; isActive?: boolean }) =>
    request<{ user: NoPassword<AdminUserRecord> }>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  listAuditLogs: () => request<{ logs: AuditLogEntry[] }>("/api/admin/audit-logs"),
};
