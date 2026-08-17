import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { listAuditLogs } from "@/lib/server/auditLog";

export async function GET() {
  try {
    requireAdmin("audit_log");
    return NextResponse.json({ logs: listAuditLogs() });
  } catch (err) {
    return errorResponse(err);
  }
}
