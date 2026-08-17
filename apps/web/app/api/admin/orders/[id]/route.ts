import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { getOrder } from "@/lib/server/orderService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin("orders");
    const result = getOrder(params.id);
    if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
