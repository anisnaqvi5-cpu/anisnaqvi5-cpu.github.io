import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let tmpDir: string;
let adminAuth: typeof import("@/lib/server/adminAuth");
let dbModule: typeof import("@/lib/server/db");

beforeAll(async () => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "wellness-admin-auth-test-"));
  process.chdir(tmpDir);
  adminAuth = await import("@/lib/server/adminAuth");
  dbModule = await import("@/lib/server/db");
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("adminAuth.loginAdmin", () => {
  it("logs in with the seeded demo credentials and creates a session record", async () => {
    const { token, admin } = await adminAuth.loginAdmin("super@wellness.demo", "wellness-admin-demo");
    expect(admin.role).toBe("super_admin");
    const session = dbModule.readDb((db) => db.adminSessions.find((s) => s.token === token));
    expect(session).toBeDefined();
    expect(session?.adminUserId).toBe(admin.id);
  });

  it("rejects a wrong password without revealing whether the account exists", async () => {
    await expect(adminAuth.loginAdmin("super@wellness.demo", "wrong-password")).rejects.toThrow(adminAuth.AdminAuthError);
    await expect(adminAuth.loginAdmin("nobody@wellness.demo", "anything")).rejects.toThrow(adminAuth.AdminAuthError);
  });

  it("rejects a deactivated admin account even with the correct password", async () => {
    const admin = dbModule.readDb((db) => db.adminUsers.find((a) => a.email === "content@wellness.demo"))!;
    await dbModule.withDb((db) => {
      const record = db.adminUsers.find((a) => a.id === admin.id)!;
      record.isActive = false;
    });
    await expect(adminAuth.loginAdmin("content@wellness.demo", "wellness-admin-demo")).rejects.toThrow(adminAuth.AdminAuthError);
  });

  it("updates lastLoginAt on successful login", async () => {
    await adminAuth.loginAdmin("orders@wellness.demo", "wellness-admin-demo");
    const admin = dbModule.readDb((db) => db.adminUsers.find((a) => a.email === "orders@wellness.demo"));
    expect(admin?.lastLoginAt).not.toBeNull();
  });
});

describe("adminAuth.logoutAdmin", () => {
  it("removes the session so it can no longer be looked up", async () => {
    const { token } = await adminAuth.loginAdmin("super@wellness.demo", "wellness-admin-demo");
    expect(dbModule.readDb((db) => db.adminSessions.some((s) => s.token === token))).toBe(true);
    await adminAuth.logoutAdmin(token);
    expect(dbModule.readDb((db) => db.adminSessions.some((s) => s.token === token))).toBe(false);
  });
});
