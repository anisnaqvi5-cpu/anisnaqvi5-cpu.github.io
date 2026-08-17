import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createAdminUser, listAdminUsers } from "@/lib/server/adminUserService";
import { adminUserCreateSchema } from "@/lib/server/validation";

export async function GET() {
  try {
    requireAdmin("admin_users");
    return NextResponse.json({ users: listAdminUsers() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("admin_users");
    const body = adminUserCreateSchema.parse(await req.json());
    const user = await createAdminUser(body);
    await logAudit(admin, "admin_user.create", "admin_user", user.id, `${user.email} (${user.role})`);
    return NextResponse.json({ user });
  } catch (err) {
    return errorResponse(err);
  }
}
