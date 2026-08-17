import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/server/adminAuth";
import { adminUpdateOrderStatus } from "@/lib/server/orderService";
import { errorResponse } from "@/lib/server/http";
import type { OrderStatus } from "@/lib/ecommerce/types";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = (await req.json()) as { status: OrderStatus; note?: string; trackingNumber?: string; carrier?: string };
    const order = await adminUpdateOrderStatus(params.id, body.status, body.note ?? "", {
      trackingNumber: body.trackingNumber,
      carrier: body.carrier,
    });
    return NextResponse.json({ order });
  } catch (err) {
    return errorResponse(err);
  }
}
