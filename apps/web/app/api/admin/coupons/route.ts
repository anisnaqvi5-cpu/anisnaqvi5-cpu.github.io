import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createCoupon } from "@/lib/server/catalogService";
import { readDb } from "@/lib/server/db";
import type { Coupon } from "@/lib/ecommerce/types";

export async function GET() {
  try {
    requireAdmin("coupons");
    return NextResponse.json({ coupons: readDb((db) => db.coupons) });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("coupons");
    const body = (await req.json()) as Omit<Coupon, "isActive">;
    const coupon = await createCoupon(body);
    await logAudit(admin, "coupon.create", "coupon", coupon.code);
    return NextResponse.json({ coupon });
  } catch (err) {
    return errorResponse(err);
  }
}
