// Client + server shared types for the e-commerce system. Mirrors
// DATABASE_SCHEMA.md's commerce domain tables (camelCase here vs. the DB's
// snake_case columns). Orders/payments are SERVER-AUTHORITATIVE — never
// trust client-computed prices or client-only order state for money.

export type Locale = "en" | "ar";

export interface Category {
  id: string;
  slug: string;
  name: Record<Locale, string>;
  tagline: Record<Locale, string>;
}

export type PrintZoneType = "text" | "color";

export interface PrintZone {
  id: string;
  type: PrintZoneType;
  label: string;
  maxChars?: number;
  colorPalette?: string[];
  fonts?: string[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  label: string; // e.g. "Sage Green / Standard"
  priceDeltaCents: number;
  stockQty: number;
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  basePriceCents: number;
  currency: "USD";
  images: string[];
  isPersonalizable: boolean;
  printZones: PrintZone[];
  variants: ProductVariant[];
  avgRating: number;
  reviewCount: number;
}

// ---- Personalization (design linked to a cart/order item — never just a
// product ID; see ECOMMERCE_SYSTEM.md "Personalization Linkage") ----------
export interface DesignElement {
  zoneId: string;
  type: PrintZoneType;
  value: string; // text content, or a hex color for "color" zones
}

export interface SavedDesign {
  id: string;
  productId: string;
  name: string;
  elements: DesignElement[];
  createdAt: string;
  updatedAt: string;
}

// ---- Client-local (browser) state ----------------------------------------
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  designId?: string; // present only for personalized items
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  country: string;
  postalCode?: string;
}

// ---- Server-authoritative order/payment domain ---------------------------
export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "in_production"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface OrderItemInput {
  variantId: string;
  quantity: number;
  design?: { productId: string; elements: DesignElement[] };
}

export interface CreateOrderRequest {
  idempotencyKey: string;
  items: OrderItemInput[];
  shippingAddress: Address;
  couponCode?: string;
}

export interface OrderItemRecord {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productTitle: string; // denormalized snapshot — immutable once ordered
  variantLabel: string;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
  designSnapshot: DesignElement[] | null; // frozen copy — see linkage note above
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note: string;
  at: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerId: string;
  status: OrderStatus;
  idempotencyKey: string;
  subtotalCents: number;
  discountCents: number;
  shippingFeeCents: number;
  totalCents: number;
  currency: "USD";
  couponCode: string | null;
  shippingAddress: Address;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistoryEntry[];
  trackingNumber?: string;
  carrier?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  provider: "stripe" | "mock";
  providerRef: string; // PaymentIntent id
  amountCents: number;
  currency: "USD";
  status: PaymentStatus;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReturnRequestStatus = "requested" | "approved" | "rejected" | "refunded";

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  reason: string;
  status: ReturnRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
  id: string;
  productId: string;
  orderItemId: string;
  customerId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: "percentage" | "fixed_amount" | "free_shipping";
  value: number; // percentage points, or cents for fixed_amount
  minOrderCents?: number;
  isActive: boolean;
}

// ===========================================================================
// Admin domain — RBAC, audit log, and the content the Admin Dashboard manages
// beyond orders/reviews/coupons (which already exist above). See
// ADMIN_DASHBOARD.md for the full permission matrix and security model.
// ===========================================================================

export type AdminRole = "super_admin" | "product_manager" | "order_manager" | "content_manager";

export interface AdminUserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // scrypt, see lib/server/passwordHash.ts — never plaintext
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminSessionRecord {
  token: string; // random, opaque — this is the ONLY thing the cookie holds
  adminUserId: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminUserId: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string; // "product.create", "order.refund", "admin_user.role_change", ...
  entityType: string;
  entityId: string;
  note?: string;
  createdAt: string;
}

export interface FontRecord {
  id: string;
  name: string;
  cssFamily: string;
  isActive: boolean;
}

export interface QuoteRecord {
  id: string;
  text: Record<Locale, string>;
  category: "gratitude" | "motivational";
  isActive: boolean;
}

export interface NotificationBroadcast {
  id: string;
  title: string;
  body: string;
  audience: "all_customers" | "recent_customers";
  sentBy: string; // admin email
  createdAt: string;
  recipientCountEstimate: number;
}

export interface CustomerSummary {
  customerId: string;
  orderCount: number;
  totalSpentCents: number;
  firstOrderAt: string;
  lastOrderAt: string;
  isReturning: boolean; // orderCount > 1
}
