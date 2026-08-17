import type { AdminRole } from "@/lib/ecommerce/types";

// Every admin-manageable area of the dashboard, gated per role. This is the
// single source of truth for access control — checked server-side on every
// admin API route (never just used to hide UI). See ADMIN_DASHBOARD.md.
export type AdminSection =
  | "dashboard"
  | "products"
  | "categories"
  | "customization"
  | "designs"
  | "orders"
  | "payments"
  | "shipping"
  | "returns"
  | "customers"
  | "coupons"
  | "reviews"
  | "wellness_content"
  | "notifications"
  | "admin_users"
  | "audit_log";

export const ALL_SECTIONS: AdminSection[] = [
  "dashboard",
  "products",
  "categories",
  "customization",
  "designs",
  "orders",
  "payments",
  "shipping",
  "returns",
  "customers",
  "coupons",
  "reviews",
  "wellness_content",
  "notifications",
  "admin_users",
  "audit_log",
];

const ROLE_SECTIONS: Record<AdminRole, AdminSection[]> = {
  super_admin: ALL_SECTIONS,
  product_manager: ["dashboard", "products", "categories", "customization", "designs", "coupons"],
  order_manager: ["dashboard", "orders", "payments", "shipping", "returns", "customers"],
  content_manager: ["dashboard", "reviews", "wellness_content", "notifications"],
};

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  product_manager: "Product Manager",
  order_manager: "Order Manager",
  content_manager: "Content Manager",
};

export function canAccess(role: AdminRole, section: AdminSection): boolean {
  return ROLE_SECTIONS[role].includes(section);
}

export function sectionsForRole(role: AdminRole): AdminSection[] {
  return ROLE_SECTIONS[role];
}
