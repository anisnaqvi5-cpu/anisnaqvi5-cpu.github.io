import { NextResponse } from "next/server";
import { listGratitudePrompts, listMindfulnessSessions, listWorkouts } from "@/lib/server/contentService";

// Public — the live wellness content library admins manage via
// /admin/wellness-content. The wellness app's fitness/mindfulness/journal
// pages fetch this, falling back to their bundled seed data
// (lib/wellness/seedData.ts) until the fetch resolves.
export async function GET() {
  const prompts = listGratitudePrompts().filter((p) => p.isActive);
  return NextResponse.json({
    workouts: listWorkouts(),
    mindfulnessSessions: listMindfulnessSessions(),
    prompts: { en: prompts.map((p) => p.text), ar: prompts.map((p) => p.textAr) },
  });
}
