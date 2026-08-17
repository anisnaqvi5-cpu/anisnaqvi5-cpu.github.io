import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createGratitudePrompt, listGratitudePrompts } from "@/lib/server/contentService";

export async function GET() {
  try {
    requireAdmin("wellness_content");
    return NextResponse.json({ prompts: listGratitudePrompts() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("wellness_content");
    const { text, textAr } = (await req.json()) as { text: string; textAr: string };
    const prompt = await createGratitudePrompt(text, textAr);
    await logAudit(admin, "prompt.create", "gratitude_prompt", prompt.id);
    return NextResponse.json({ prompt });
  } catch (err) {
    return errorResponse(err);
  }
}
