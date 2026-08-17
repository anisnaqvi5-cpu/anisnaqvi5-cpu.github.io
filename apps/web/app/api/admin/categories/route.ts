import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createCategory, listCategories } from "@/lib/server/catalogService";
import type { Category } from "@/lib/ecommerce/types";

export async function GET() {
  try {
    requireAdmin("categories");
    return NextResponse.json({ categories: listCategories() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("categories");
    const body = (await req.json()) as Omit<Category, "id">;
    const category = await createCategory(body);
    await logAudit(admin, "category.create", "category", category.id, category.name.en);
    return NextResponse.json({ category });
  } catch (err) {
    return errorResponse(err);
  }
}
