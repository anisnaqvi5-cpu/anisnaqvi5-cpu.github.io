import { NextResponse } from "next/server";
import { createReview, listReviews } from "@/lib/server/orderService";
import { getCustomerId, errorResponse } from "@/lib/server/http";

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
  try {
    const customerId = getCustomerId(req);
    const body = (await req.json()) as { productId: string; orderItemId: string; rating: 1 | 2 | 3 | 4 | 5; comment: string };
    const review = await createReview({ ...body, customerId });
    return NextResponse.json({ review });
  } catch (err) {
    return errorResponse(err);
  }
}
