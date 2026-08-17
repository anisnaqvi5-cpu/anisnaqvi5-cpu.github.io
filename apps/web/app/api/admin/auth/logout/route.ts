import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, getCurrentAdmin, logoutAdmin } from "@/lib/server/adminAuth";
import { logAudit } from "@/lib/server/auditLog";

export async function POST() {
  const admin = getCurrentAdmin();
  const token = cookies().get(ADMIN_COOKIE)?.value;
  await logoutAdmin(token);
  if (admin) await logAudit(admin, "auth.logout", "admin_user", admin.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
