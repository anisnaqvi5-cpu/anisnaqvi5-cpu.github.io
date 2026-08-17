import { NextResponse } from "next/server";
import { previewOrderTotals } from "@/lib/server/orderService";
import { errorResponse } from "@/lib/server/http";
import { rateLimitOrNull } from "@/lib/server/rateLimit";
import { previewTotalsSchema } from "@/lib/server/validation";

// Lets the cart/checkout UI show accurate totals (incl. coupon validation)
// before placing an order — computed with the SAME server-side logic
// createOrder uses, so the number shown never drifts from what gets charged.
export async function POST(req: Request) {
  const limited = rateLimitOrNull(req, { key: "preview-totals", limit: 60, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const { items, couponCode } = previewTotalsSchema.parse(await req.json());
    const totals = previewOrderTotals(items, couponCode);
    return NextResponse.json(totals);
  } catch (err) {
    return errorResponse(err);
  }
}
