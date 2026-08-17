import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/server/adminAuth";
import { adminResolveReturn } from "@/lib/server/orderService";
import { errorResponse } from "@/lib/server/http";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { action } = (await req.json()) as { action: "approve" | "reject" };
    await adminResolveReturn(params.id, action);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
