import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createMindfulnessSession, listMindfulnessSessions } from "@/lib/server/contentService";
import type { MindfulnessSession } from "@/lib/types";

export async function GET() {
  try {
    requireAdmin("wellness_content");
    return NextResponse.json({ sessions: listMindfulnessSessions() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("wellness_content");
    const body = (await req.json()) as Omit<MindfulnessSession, "id">;
    const session = await createMindfulnessSession(body);
    await logAudit(admin, "mindfulness.create", "mindfulness_session", session.id, session.title);
    return NextResponse.json({ session });
  } catch (err) {
    return errorResponse(err);
  }
}
