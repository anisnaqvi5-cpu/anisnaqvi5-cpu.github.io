import { test, expect } from "@playwright/test";

async function loginAs(page: import("@playwright/test").Page, email: string) {
  await page.goto("/admin/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill("wellness-admin-demo");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/admin$/, { timeout: 10_000 });
}

test("super_admin sees every admin nav section", async ({ page }) => {
  await loginAs(page, "super@wellness.demo");
  for (const label of ["Products", "Orders", "Admin Users", "Audit Log", "Wellness Content"]) {
    await expect(page.getByRole("link", { name: label })).toBeVisible();
  }
});

test("content_manager only sees content-scoped sections, and the server rejects direct access to an out-of-scope page's data", async ({ page }) => {
  await loginAs(page, "content@wellness.demo");

  await expect(page.getByRole("link", { name: "Wellness Content" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Reviews" })).toBeVisible();
  // Out-of-scope sections must not appear in the nav for this role.
  await expect(page.getByRole("link", { name: "Products" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Admin Users" })).toHaveCount(0);

  // RBAC must be enforced server-side, not just hidden in the UI — a direct
  // API call for an out-of-scope section should be rejected even though the
  // content_manager has a valid, authenticated session.
  const res = await page.request.get("/api/admin/products");
  expect(res.status()).toBe(403);
});

test("an unauthenticated request to an admin API is rejected", async ({ page }) => {
  const res = await page.request.get("/api/admin/orders");
  expect(res.status()).toBe(401);
});
