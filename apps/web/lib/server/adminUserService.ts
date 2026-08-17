import crypto from "node:crypto";
import type { AdminRole, AdminUserRecord } from "@/lib/ecommerce/types";
import { readDb, withDb } from "@/lib/server/db";
import { OrderError } from "@/lib/server/errors";
import { hashPassword } from "@/lib/server/passwordHash";

export function listAdminUsers(): Omit<AdminUserRecord, "passwordHash">[] {
  return readDb((db) => db.adminUsers.map(({ passwordHash, ...rest }) => rest));
}

export async function createAdminUser(input: { email: string; name: string; password: string; role: AdminRole }): Promise<Omit<AdminUserRecord, "passwordHash">> {
  return withDb((db) => {
    if (db.adminUsers.some((a) => a.email.toLowerCase() === input.email.toLowerCase())) {
      throw new OrderError("duplicate_email", "An admin with that email already exists.");
    }
    const user: AdminUserRecord = {
      id: crypto.randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(input.password),
      role: input.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    db.adminUsers.push(user);
    const { passwordHash, ...rest } = user;
    return rest;
  });
}

export async function updateAdminUser(id: string, patch: { role?: AdminRole; isActive?: boolean }, actingAdminId: string): Promise<Omit<AdminUserRecord, "passwordHash">> {
  return withDb((db) => {
    const user = db.adminUsers.find((a) => a.id === id);
    if (!user) throw new OrderError("not_found", "Admin user not found.");
    if (id === actingAdminId && patch.isActive === false) {
      throw new OrderError("cannot_deactivate_self", "You cannot deactivate your own account.");
    }
    Object.assign(user, patch);
    const { passwordHash, ...rest } = user;
    return rest;
  });
}
