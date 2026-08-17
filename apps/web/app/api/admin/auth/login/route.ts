import { NextResponse } from "next/server";
import { ADMIN_COOKIE, loginAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { logger } from "@/lib/server/logger";
import { rateLimitOrNull } from "@/lib/server/rateLimit";
import { loginSchema } from "@/lib/server/validation";

export async function POST(req: Request) {
  // Strict: brute-forcing admin passwords is the single highest-value
  // target on this app. 5 attempts per 5 minutes per IP.
  const limited = rateLimitOrNull(req, { key: "admin-login", limit: 5, windowMs: 5 * 60_000 });
  if (limited) return limited;

  try {
    const { email, password } = loginSchema.parse(await req.json());
    const { token, admin } = await loginAdmin(email, password);
    await logAudit(admin, "auth.login", "admin_user", admin.id);
    const res = NextResponse.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
    res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    return res;
  } catch (err) {
    logger.warn("admin_login_failed", { error: err instanceof Error ? err.message : String(err) });
    return errorResponse(err);
  }
}
