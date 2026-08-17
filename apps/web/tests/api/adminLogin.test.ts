import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let tmpDir: string;
let loginRoute: typeof import("@/app/api/admin/auth/login/route");

function jsonRequest(body: unknown, ip = "203.0.113.1") {
  return new Request("http://localhost/api/admin/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wellness-api-login-test-"));
  process.chdir(tmpDir);
  loginRoute = await import("@/app/api/admin/auth/login/route");
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("POST /api/admin/auth/login", () => {
  it("rejects invalid credentials with 401 and no session cookie", async () => {
    const res = await loginRoute.POST(jsonRequest({ email: "super@wellness.demo", password: "wrong-password" }, "203.0.113.10"));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("rejects a malformed payload with a validation (400) error, not a 500", async () => {
    const res = await loginRoute.POST(jsonRequest({ email: "not-an-email" }, "203.0.113.11"));
    expect(res.status).toBe(400);
  });

  it("accepts the seeded super admin's demo credentials and sets a session cookie", async () => {
    const res = await loginRoute.POST(jsonRequest({ email: "super@wellness.demo", password: "wellness-admin-demo" }, "203.0.113.12"));
    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("wellness_admin_session=");
    expect(setCookie).toContain("HttpOnly");
    const body = await res.json();
    expect(body.admin.role).toBe("super_admin");
  });

  it("rate-limits repeated login attempts from the same IP (brute-force protection)", async () => {
    const ip = "203.0.113.99";
    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const res = await loginRoute.POST(jsonRequest({ email: "super@wellness.demo", password: "wrong" }, ip));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
