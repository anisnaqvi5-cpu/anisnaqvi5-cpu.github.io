import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/server/adminAuth";
import { listAllOrders } from "@/lib/server/orderService";
import type { OrderStatus } from "@/lib/ecommerce/types";

export async function GET(req: Request) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as OrderStatus | null;
  return NextResponse.json({ orders: listAllOrders(status ?? undefined) });
}
