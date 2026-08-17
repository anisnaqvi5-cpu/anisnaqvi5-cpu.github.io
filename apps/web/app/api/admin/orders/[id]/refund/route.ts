import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { adminRefundOrder } from "@/lib/server/orderService";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("orders");
    const order = await adminRefundOrder(params.id);
    await logAudit(admin, "order.refund", "order", params.id);
    return NextResponse.json({ order });
  } catch (err) {
    return errorResponse(err);
  }
}
