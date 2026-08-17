import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { addVariant } from "@/lib/server/catalogService";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("products");
    const body = (await req.json()) as { sku: string; label: string; priceDeltaCents: number; stockQty: number };
    const product = await addVariant(params.id, body);
    await logAudit(admin, "variant.create", "product", params.id, body.label);
    return NextResponse.json({ product });
  } catch (err) {
    return errorResponse(err);
  }
}
