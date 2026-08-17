import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/server/adminAuth";
import { adminRefundOrder } from "@/lib/server/orderService";
import { errorResponse } from "@/lib/server/http";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const order = await adminRefundOrder(params.id);
    return NextResponse.json({ order });
  } catch (err) {
    return errorResponse(err);
  }
}
