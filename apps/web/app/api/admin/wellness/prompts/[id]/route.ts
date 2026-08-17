import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteGratitudePrompt, updateGratitudePrompt } from "@/lib/server/contentService";
import type { GratitudePromptRecord } from "@/lib/server/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("wellness_content");
    const patch = (await req.json()) as Partial<GratitudePromptRecord>;
    const prompt = await updateGratitudePrompt(params.id, patch);
    await logAudit(admin, "prompt.update", "gratitude_prompt", params.id);
    return NextResponse.json({ prompt });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("wellness_content");
    await deleteGratitudePrompt(params.id);
    await logAudit(admin, "prompt.delete", "gratitude_prompt", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
