import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { listAllReviews } from "@/lib/server/orderService";

export async function GET() {
  try {
    requireAdmin("reviews");
    return NextResponse.json({ reviews: listAllReviews() });
  } catch (err) {
    return errorResponse(err);
  }
}
