import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { listAllOrders } from "@/lib/server/orderService";
import type { OrderStatus } from "@/lib/ecommerce/types";

export async function GET(req: Request) {
  try {
    requireAdmin("orders");
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as OrderStatus | null;
    return NextResponse.json({ orders: listAllOrders(status ?? undefined) });
  } catch (err) {
    return errorResponse(err);
  }
}
