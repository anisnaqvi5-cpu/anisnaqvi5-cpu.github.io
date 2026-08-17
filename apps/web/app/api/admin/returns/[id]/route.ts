import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { adminResolveReturn } from "@/lib/server/orderService";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("returns");
    const { action } = (await req.json()) as { action: "approve" | "reject" };
    await adminResolveReturn(params.id, action);
    await logAudit(admin, `return.${action}`, "return_request", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
