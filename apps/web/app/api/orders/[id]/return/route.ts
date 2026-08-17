import { NextResponse } from "next/server";
import { requestReturn } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";
import { returnRequestSchema } from "@/lib/server/validation";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const customerId = getCustomerId(req);
    const { orderItemId, reason } = returnRequestSchema.parse(await req.json());
    const request = await requestReturn({ orderId: params.id, orderItemId, customerId, reason: reason || "Not specified" });
    return NextResponse.json({ request });
  } catch (err) {
    return errorResponse(err);
  }
}
