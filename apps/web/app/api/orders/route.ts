import { NextResponse } from "next/server";
import { listOrdersForCustomer } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";

export async function GET(req: Request) {
  try {
    const customerId = getCustomerId(req);
    return NextResponse.json({ orders: listOrdersForCustomer(customerId) });
  } catch (err) {
    return errorResponse(err);
  }
}
