import { test, expect } from "@playwright/test";

// Full personalization-flow + payment-flow E2E: customize a product, add it
// to the cart, place an order, and settle payment via the mock provider
// (active by default — no Stripe keys configured in this environment).
test("customize a product, check out, and complete payment", async ({ page }) => {
  await page.goto("/shop/products/flow-yoga-mat");

  await page.getByPlaceholder("Enter name").fill("Playwright E2E");
  await page.getByRole("button", { name: "#7A9471" }).click();

  await page.getByRole("button", { name: "Add to Cart" }).click();
  await expect(page.getByText("Added to cart")).toBeVisible();

  await page.goto("/shop/cart");
  await expect(page.getByText("Personalized: Playwright E2E")).toBeVisible();

  await page.getByRole("link", { name: "Proceed to Checkout" }).click();
  await expect(page).toHaveURL(/\/shop\/checkout/);

  await page.getByPlaceholder("Full name").fill("Playwright Tester");
  await page.getByPlaceholder("Phone").fill("+1-555-0199");
  await page.getByPlaceholder("Address line 1").fill("100 Test Ave");
  await page.getByPlaceholder("City").fill("Testville");

  await page.getByRole("button", { name: "Continue to Payment" }).click();
  await expect(page.getByText(/^Order ORD-/)).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Simulate Successful Payment" }).click();
  await expect(page).toHaveURL(/\/shop\/order-confirmation\//, { timeout: 10_000 });
  await expect(page.getByRole("heading", { name: "Order placed!" })).toBeVisible();
});

test("a declined payment can be retried without creating a duplicate order", async ({ page }) => {
  await page.goto("/shop/products/gratitude-journal");
  await page.getByPlaceholder("Enter name").fill("Retry Test");
  await page.getByRole("button", { name: "Add to Cart" }).click();

  await page.goto("/shop/checkout");
  await page.getByPlaceholder("Full name").fill("Retry Tester");
  await page.getByPlaceholder("Phone").fill("+1-555-0198");
  await page.getByPlaceholder("Address line 1").fill("200 Retry Rd");
  await page.getByPlaceholder("City").fill("Retryville");
  await page.getByRole("button", { name: "Continue to Payment" }).click();

  await expect(page.getByText(/^Order ORD-/)).toBeVisible({ timeout: 10_000 });
  await page.getByRole("button", { name: "Simulate Decline" }).click();
  await expect(page.getByText(/declined/i)).toBeVisible();

  // Retry succeeds and lands on confirmation — no duplicate order was created
  // because the client reuses the same idempotency key across attempts.
  await page.getByRole("button", { name: "Simulate Successful Payment" }).click();
  await expect(page).toHaveURL(/\/shop\/order-confirmation\//, { timeout: 10_000 });
});
