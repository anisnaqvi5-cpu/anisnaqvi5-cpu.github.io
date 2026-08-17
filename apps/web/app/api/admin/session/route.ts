import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/server/adminAuth";

export async function GET() {
  return NextResponse.json({ authed: isAdminAuthed() });
}
