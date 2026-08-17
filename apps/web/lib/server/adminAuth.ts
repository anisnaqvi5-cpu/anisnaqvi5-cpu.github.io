import { cookies } from "next/headers";

// Minimal passcode gate standing in for a real admin role check
// (Supabase Auth + `admin_users` per ARCHITECTURE.md/DATABASE_SCHEMA.md in
// production). Good enough to demonstrate a protected admin surface without
// building a full auth system for this demo.
export const ADMIN_COOKIE = "wellness_admin_session";

function adminPasscode(): string {
  return process.env.ADMIN_PASSCODE || "wellness-admin-demo";
}

export function checkPasscode(passcode: string): boolean {
  return passcode === adminPasscode();
}

export function isAdminAuthed(): boolean {
  return cookies().get(ADMIN_COOKIE)?.value === "granted";
}
