import { describe, expect, it } from "vitest";
import { ALL_SECTIONS, canAccess, sectionsForRole } from "@/lib/server/permissions";

describe("RBAC permission matrix", () => {
  it("grants super_admin access to every section", () => {
    for (const section of ALL_SECTIONS) {
      expect(canAccess("super_admin", section)).toBe(true);
    }
  });

  it("scopes product_manager to catalog/customization sections only", () => {
    expect(canAccess("product_manager", "products")).toBe(true);
    expect(canAccess("product_manager", "customization")).toBe(true);
    expect(canAccess("product_manager", "orders")).toBe(false);
    expect(canAccess("product_manager", "admin_users")).toBe(false);
  });

  it("scopes order_manager to orders/payments/shipping/returns/customers only", () => {
    expect(canAccess("order_manager", "orders")).toBe(true);
    expect(canAccess("order_manager", "payments")).toBe(true);
    expect(canAccess("order_manager", "products")).toBe(false);
    expect(canAccess("order_manager", "wellness_content")).toBe(false);
  });

  it("scopes content_manager to reviews/wellness_content/notifications only", () => {
    expect(canAccess("content_manager", "reviews")).toBe(true);
    expect(canAccess("content_manager", "wellness_content")).toBe(true);
    expect(canAccess("content_manager", "orders")).toBe(false);
    expect(canAccess("content_manager", "admin_users")).toBe(false);
  });

  it("never grants admin_users or audit_log to a non-super_admin role", () => {
    for (const role of ["product_manager", "order_manager", "content_manager"] as const) {
      expect(canAccess(role, "admin_users")).toBe(false);
      expect(canAccess(role, "audit_log")).toBe(false);
    }
  });

  it("sectionsForRole stays consistent with canAccess for every role/section pair", () => {
    const roles = ["super_admin", "product_manager", "order_manager", "content_manager"] as const;
    for (const role of roles) {
      const allowed = new Set(sectionsForRole(role));
      for (const section of ALL_SECTIONS) {
        expect(allowed.has(section)).toBe(canAccess(role, section));
      }
    }
  });
});
