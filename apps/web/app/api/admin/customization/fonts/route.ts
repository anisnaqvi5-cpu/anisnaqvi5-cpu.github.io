import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createFont, listFonts } from "@/lib/server/contentService";
import type { FontRecord } from "@/lib/ecommerce/types";

export async function GET() {
  try {
    requireAdmin("customization");
    return NextResponse.json({ fonts: listFonts() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("customization");
    const body = (await req.json()) as Omit<FontRecord, "id">;
    const font = await createFont(body);
    await logAudit(admin, "font.create", "font", font.id, font.name);
    return NextResponse.json({ font });
  } catch (err) {
    return errorResponse(err);
  }
}
