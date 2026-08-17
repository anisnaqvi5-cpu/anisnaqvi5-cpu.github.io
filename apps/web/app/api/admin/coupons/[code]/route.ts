import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteCoupon, updateCoupon } from "@/lib/server/catalogService";
import type { Coupon } from "@/lib/ecommerce/types";

export async function PATCH(req: Request, { params }: { params: { code: string } }) {
  try {
    const admin = requireAdmin("coupons");
    const patch = (await req.json()) as Partial<Coupon>;
    const coupon = await updateCoupon(params.code, patch);
    await logAudit(admin, "coupon.update", "coupon", params.code);
    return NextResponse.json({ coupon });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { code: string } }) {
  try {
    const admin = requireAdmin("coupons");
    await deleteCoupon(params.code);
    await logAudit(admin, "coupon.delete", "coupon", params.code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
