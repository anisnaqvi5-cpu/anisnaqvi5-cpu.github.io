import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { removeVariant, updateVariant } from "@/lib/server/catalogService";
import type { ProductVariant } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { id: string; variantId: string } }) {
  try {
    const admin = requireAdmin("products");
    const patch = (await req.json()) as Partial<Omit<ProductVariant, "id">>;
    const product = await updateVariant(params.id, params.variantId, patch);
    await logAudit(admin, "variant.update", "product", params.id, params.variantId);
    return NextResponse.json({ product });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string; variantId: string } }) {
  try {
    const admin = requireAdmin("products");
    const product = await removeVariant(params.id, params.variantId);
    await logAudit(admin, "variant.delete", "product", params.id, params.variantId);
    return NextResponse.json({ product });
  } catch (err) {
    return errorResponse(err);
  }
}
