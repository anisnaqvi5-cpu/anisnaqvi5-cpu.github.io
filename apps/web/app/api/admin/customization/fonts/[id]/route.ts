import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteFont, updateFont } from "@/lib/server/contentService";
import type { FontRecord } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("customization");
    const patch = (await req.json()) as Partial<FontRecord>;
    const font = await updateFont(params.id, patch);
    await logAudit(admin, "font.update", "font", params.id);
    return NextResponse.json({ font });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("customization");
    await deleteFont(params.id);
    await logAudit(admin, "font.delete", "font", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
