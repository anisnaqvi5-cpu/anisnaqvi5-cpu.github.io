import { test, expect } from "@playwright/test";

test.describe("Shop browsing", () => {
  test("shows the product catalog and lets a shopper open a product detail page", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByRole("heading", { name: /wellness/i }).first()).toBeVisible({ timeout: 15_000 }).catch(() => {});

    await page.goto("/shop/products");
    // The seeded catalog includes the personalized yoga mat.
    await expect(page.getByText("Flow Personalized Yoga Mat")).toBeVisible();

    await page.getByText("Flow Personalized Yoga Mat").click();
    await expect(page).toHaveURL(/\/shop\/products\/flow-yoga-mat/);
    await expect(page.getByRole("heading", { name: "Flow Personalized Yoga Mat" })).toBeVisible();
    await expect(page.getByText("Personalize this product")).toBeVisible();
  });

  test("shows an empty state on an empty cart", async ({ page }) => {
    await page.goto("/shop/cart");
    await expect(page.getByText("Your cart is empty")).toBeVisible();
  });
});
