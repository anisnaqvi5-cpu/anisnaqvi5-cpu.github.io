import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { listCustomers } from "@/lib/server/customerService";

export async function GET() {
  try {
    requireAdmin("customers");
    return NextResponse.json({ customers: listCustomers() });
  } catch (err) {
    return errorResponse(err);
  }
}
