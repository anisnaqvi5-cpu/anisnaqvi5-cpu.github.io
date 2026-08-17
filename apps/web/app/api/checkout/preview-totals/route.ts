import { NextResponse } from "next/server";
import { previewOrderTotals } from "@/lib/server/orderService";
import { errorResponse } from "@/lib/server/http";
import type { OrderItemInput } from "@/lib/ecommerce/types";

// Lets the cart/checkout UI show accurate totals (incl. coupon validation)
// before placing an order — computed with the SAME server-side logic
// createOrder uses, so the number shown never drifts from what gets charged.
export async function POST(req: Request) {
  try {
    const { items, couponCode } = (await req.json()) as { items: OrderItemInput[]; couponCode?: string };
    const totals = previewOrderTotals(items, couponCode);
    return NextResponse.json(totals);
  } catch (err) {
    return errorResponse(err);
  }
}
