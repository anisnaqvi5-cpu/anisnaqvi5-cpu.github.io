import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let tmpDir: string;
let createOrderRoute: typeof import("@/app/api/checkout/create-order/route");
let catalogRoute: typeof import("@/app/api/shop/catalog/route");

function req(url: string, body: unknown, customerId = "customer-abc") {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-customer-id": customerId, "x-forwarded-for": "198.51.100.5" },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wellness-api-checkout-test-"));
  process.chdir(tmpDir);
  createOrderRoute = await import("@/app/api/checkout/create-order/route");
  catalogRoute = await import("@/app/api/shop/catalog/route");
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("GET /api/shop/catalog", () => {
  it("returns the live product and category catalog", async () => {
    const res = await catalogRoute.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);
    expect(Array.isArray(body.categories)).toBe(true);
  });
});

describe("POST /api/checkout/create-order", () => {
  it("rejects a request missing the X-Customer-Id header", async () => {
    const bareReq = new Request("http://localhost/api/checkout/create-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ idempotencyKey: "k1", items: [], shippingAddress: {} }),
    });
    const res = await createOrderRoute.POST(bareReq);
    expect(res.status).toBe(401);
  });

  it("rejects a malformed body (zod validation) with 400, not 500", async () => {
    const res = await createOrderRoute.POST(
      req("http://localhost/api/checkout/create-order", { idempotencyKey: "", items: [], shippingAddress: {} })
    );
    expect(res.status).toBe(400);
  });

  it("creates an order for a valid personalized cart and returns a client secret", async () => {
    const body = {
      idempotencyKey: "api-test-order-1",
      items: [
        {
          variantId: "var-mat-standard",
          quantity: 1,
          design: { productId: "prod-mat-flow", elements: [{ zoneId: "mat-name", type: "text", value: "Huda" }] },
        },
      ],
      shippingAddress: {
        fullName: "Huda Test",
        phone: "+1-555-0101",
        line1: "42 Main St",
        city: "Testopolis",
        country: "US",
      },
    };
    const res = await createOrderRoute.POST(req("http://localhost/api/checkout/create-order", body));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.order.status).toBe("pending_payment");
    expect(json.clientSecret).toBeTruthy();
    expect(json.provider).toBe("mock");
  });
});
