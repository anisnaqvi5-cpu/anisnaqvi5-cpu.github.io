import { NextResponse } from "next/server";
import { ADMIN_COOKIE, loginAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";

export async function POST(req: Request) {
  try {
    const { email, password } = (await req.json()) as { email: string; password: string };
    const { token, admin } = await loginAdmin(email, password);
    await logAudit(admin, "auth.login", "admin_user", admin.id);
    const res = NextResponse.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
    res.cookies.set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
