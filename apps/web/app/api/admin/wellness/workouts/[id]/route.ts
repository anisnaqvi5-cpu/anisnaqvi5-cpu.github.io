import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { deleteWorkout, updateWorkout } from "@/lib/server/contentService";
import type { Workout } from "@/lib/types";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("wellness_content");
    const patch = (await req.json()) as Partial<Workout>;
    const workout = await updateWorkout(params.id, patch);
    await logAudit(admin, "workout.update", "workout", params.id);
    return NextResponse.json({ workout });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = requireAdmin("wellness_content");
    await deleteWorkout(params.id);
    await logAudit(admin, "workout.delete", "workout", params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
