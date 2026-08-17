import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { adminUpdateOrderStatus } from "@/lib/server/orderService";
import type { OrderStatus } from "@/lib/ecommerce/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("orders");
    const body = (await req.json()) as { status: OrderStatus; note?: string; trackingNumber?: string; carrier?: string };
    const order = await adminUpdateOrderStatus(params.id, body.status, body.note ?? "", {
      trackingNumber: body.trackingNumber,
      carrier: body.carrier,
    });
    await logAudit(admin, "order.status_update", "order", params.id, `-> ${body.status}${body.note ? `: ${body.note}` : ""}`);
    return NextResponse.json({ order });
  } catch (err) {
    return errorResponse(err);
  }
}
