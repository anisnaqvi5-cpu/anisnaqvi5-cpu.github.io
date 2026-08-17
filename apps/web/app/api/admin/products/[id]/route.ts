import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteProduct, updateProduct } from "@/lib/server/catalogService";
import type { Product } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("products");
    const patch = (await req.json()) as Partial<Product>;
    const product = await updateProduct(params.id, patch);
    await logAudit(admin, "product.update", "product", params.id, Object.keys(patch).join(", "));
    return NextResponse.json({ product });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("products");
    await deleteProduct(params.id);
    await logAudit(admin, "product.delete", "product", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
