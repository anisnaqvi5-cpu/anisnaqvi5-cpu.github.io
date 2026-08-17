import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteReview, moderateReview } from "@/lib/server/orderService";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("reviews");
    const { status } = (await req.json()) as { status: "approved" | "rejected" };
    const review = await moderateReview(params.id, status);
    await logAudit(admin, `review.${status}`, "review", params.id);
    return NextResponse.json({ review });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("reviews");
    await deleteReview(params.id);
    await logAudit(admin, "review.delete", "review", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
