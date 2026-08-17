import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { AdminUserRecord } from "@/lib/ecommerce/types";
import { readDb, withDb } from "@/lib/server/db";
import { hashPassword, verifyPassword } from "@/lib/server/passwordHash";
import { canAccess, type AdminSection } from "@/lib/server/permissions";

export const ADMIN_COOKIE = "wellness_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

export class AdminAuthError extends Error {
  constructor(public status: 401 | 403, message: string) {
    super(message);
  }
}

export async function loginAdmin(email: string, password: string): Promise<{ token: string; admin: AdminUserRecord }> {
  const admin = readDb((db) => db.adminUsers.find((a) => a.email.toLowerCase() === email.toLowerCase()));
  if (!admin || !admin.isActive || !verifyPassword(password, admin.passwordHash)) {
    // Same error for "no such user" and "wrong password" — don't leak which.
    throw new AdminAuthError(401, "Invalid email or password.");
  }

  const token = crypto.randomUUID();
  await withDb((db) => {
    db.adminSessions.push({ token, adminUserId: admin.id, createdAt: new Date().toISOString(), expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() });
    const user = db.adminUsers.find((a) => a.id === admin.id)!;
    user.lastLoginAt = new Date().toISOString();
  });

  return { token, admin };
}

export async function logoutAdmin(token: string | undefined): Promise<void> {
  if (!token) return;
  await withDb((db) => {
    db.adminSessions = db.adminSessions.filter((s) => s.token !== token);
  });
}

/** Reads the session cookie and returns the authenticated admin, or null. Expired sessions are treated as logged out. */
export function getCurrentAdmin(): AdminUserRecord | null {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return readDb((db) => {
    const session = db.adminSessions.find((s) => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) return null;
    const admin = db.adminUsers.find((a) => a.id === session.adminUserId);
    return admin && admin.isActive ? admin : null;
  });
}

/** Server-side gate for every admin API route: verifies session AND role permission for the section being accessed. Throws AdminAuthError — never silently allows. */
export function requireAdmin(section: AdminSection): AdminUserRecord {
  const admin = getCurrentAdmin();
  if (!admin) throw new AdminAuthError(401, "Not signed in.");
  if (!canAccess(admin.role, section)) throw new AdminAuthError(403, `Your role (${admin.role}) does not have access to ${section}.`);
  return admin;
}

export { hashPassword };
