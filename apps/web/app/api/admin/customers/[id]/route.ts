import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { getCustomer } from "@/lib/server/customerService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    requireAdmin("customers");
    const result = getCustomer(params.id);
    if (!result) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
