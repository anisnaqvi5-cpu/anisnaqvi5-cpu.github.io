import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteCategory, updateCategory } from "@/lib/server/catalogService";
import type { Category } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("categories");
    const patch = (await req.json()) as Partial<Category>;
    const category = await updateCategory(params.id, patch);
    await logAudit(admin, "category.update", "category", params.id);
    return NextResponse.json({ category });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("categories");
    await deleteCategory(params.id);
    await logAudit(admin, "category.delete", "category", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
