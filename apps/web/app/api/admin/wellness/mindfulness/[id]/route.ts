import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteMindfulnessSession, updateMindfulnessSession } from "@/lib/server/contentService";
import type { MindfulnessSession } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("wellness_content");
    const patch = (await req.json()) as Partial<MindfulnessSession>;
    const session = await updateMindfulnessSession(params.id, patch);
    await logAudit(admin, "mindfulness.update", "mindfulness_session", params.id);
    return NextResponse.json({ session });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("wellness_content");
    await deleteMindfulnessSession(params.id);
    await logAudit(admin, "mindfulness.delete", "mindfulness_session", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
