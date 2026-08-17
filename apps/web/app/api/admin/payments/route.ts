import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { readDb } from "@/lib/server/db";

export async function GET() {
  try {
    requireAdmin("payments");
    const payments = readDb((db) => [...db.payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    return NextResponse.json({ payments });
  } catch (err) {
    return errorResponse(err);
  }
}
