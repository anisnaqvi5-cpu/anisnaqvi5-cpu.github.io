import { NextResponse } from "next/server";
import { cancelOrder } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = getCustomerId(req);
    const order = await cancelOrder(params.id, customerId);
    return NextResponse.json({ order });
  } catch (err) {
    return errorResponse(err);
  }
}
