import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { updateAdminUser } from "@/lib/server/adminUserService";
import type { AdminRole } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("admin_users");
    const patch = (await req.json()) as { role?: AdminRole; isActive?: boolean };
    const user = await updateAdminUser(params.id, patch, admin.id);
    await logAudit(admin, "admin_user.update", "admin_user", params.id, JSON.stringify(patch));
    return NextResponse.json({ user });
  } catch (err) {
    return errorResponse(err);
  }
}
