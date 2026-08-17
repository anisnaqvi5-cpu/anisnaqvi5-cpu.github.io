import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createWorkout, listWorkouts } from "@/lib/server/contentService";
import type { Workout } from "@/lib/types";

export async function GET() {
  try {
    requireAdmin("wellness_content");
    return NextResponse.json({ workouts: listWorkouts() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("wellness_content");
    const body = (await req.json()) as Omit<Workout, "id">;
    const workout = await createWorkout(body);
    await logAudit(admin, "workout.create", "workout", workout.id, workout.title);
    return NextResponse.json({ workout });
  } catch (err) {
    return errorResponse(err);
  }
}
