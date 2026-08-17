import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteQuote, updateQuote } from "@/lib/server/contentService";
import type { QuoteRecord } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("customization");
    const patch = (await req.json()) as Partial<QuoteRecord>;
    const quote = await updateQuote(params.id, patch);
    await logAudit(admin, "quote.update", "quote", params.id);
    return NextResponse.json({ quote });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("customization");
    await deleteQuote(params.id);
    await logAudit(admin, "quote.delete", "quote", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
