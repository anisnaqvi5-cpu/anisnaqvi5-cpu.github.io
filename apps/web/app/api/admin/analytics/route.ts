import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { getDashboardMetrics } from "@/lib/server/analyticsService";

export async function GET(req: Request) {
  try {
    requireAdmin("dashboard");
    const { searchParams } = new URL(req.url);
    const rangeDays = Number(searchParams.get("range")) || 30;
    return NextResponse.json(getDashboardMetrics(rangeDays));
  } catch (err) {
    return errorResponse(err);
  }
}
