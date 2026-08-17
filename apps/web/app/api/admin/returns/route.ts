import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/server/adminAuth";
import { listReturnRequests } from "@/lib/server/orderService";

export async function GET() {
  if (!isAdminAuthed()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ returns: listReturnRequests() });
}
