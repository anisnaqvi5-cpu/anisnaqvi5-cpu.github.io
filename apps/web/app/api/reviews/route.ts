import { NextResponse } from "next/server";
import { createReview, listReviews } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";
import { rateLimitOrNull } from "@/lib/server/rateLimit";
import { reviewCreateSchema } from "@/lib/server/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) return NextResponse.json({ error: "missing_product_id" }, { status: 400 });
    return NextResponse.json({ reviews: listReviews(productId) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  const limited = rateLimitOrNull(req, { key: "review-create", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const customerId = getCustomerId(req);
    const body = reviewCreateSchema.parse(await req.json());
    const review = await createReview({ ...body, customerId });
    return NextResponse.json({ review });
  } catch (err) {
    return errorResponse(err);
  }
}
