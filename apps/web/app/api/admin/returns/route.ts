import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { listReturnRequests } from "@/lib/server/orderService";

export async function GET() {
  try {
    requireAdmin("returns");
    return NextResponse.json({ returns: listReturnRequests() });
  } catch (err) {
    return errorResponse(err);
  }
}
