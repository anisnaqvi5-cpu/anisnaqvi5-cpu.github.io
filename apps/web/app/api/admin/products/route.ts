import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createProduct, listProducts } from "@/lib/server/catalogService";
import type { Product } from "@/lib/ecommerce/types";

export async function GET() {
  try {
    requireAdmin("products");
    return NextResponse.json({ products: listProducts() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("products");
    const body = (await req.json()) as Omit<Product, "id" | "avgRating" | "reviewCount">;
    const product = await createProduct(body);
    await logAudit(admin, "product.create", "product", product.id, product.title.en);
    return NextResponse.json({ product });
  } catch (err) {
    return errorResponse(err);
  }
}
