import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createQuote, listQuotes } from "@/lib/server/contentService";
import type { QuoteRecord } from "@/lib/ecommerce/types";

export async function GET() {
  try {
    requireAdmin("customization");
    return NextResponse.json({ quotes: listQuotes() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("customization");
    const body = (await req.json()) as Omit<QuoteRecord, "id">;
    const quote = await createQuote(body);
    await logAudit(admin, "quote.create", "quote", quote.id);
    return NextResponse.json({ quote });
  } catch (err) {
    return errorResponse(err);
  }
}
