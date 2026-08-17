import { NextResponse } from "next/server";
import { getOrder } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = getCustomerId(req);
    const result = getOrder(params.id, customerId);
    if (!result) return NextResponse.json({ error: "not_found", message: "Order not found." }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
