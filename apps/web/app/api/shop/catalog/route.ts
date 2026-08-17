import { NextResponse } from "next/server";
import { listCategories, listProducts } from "@/lib/server/catalogService";
import { errorResponse } from "@/lib/server/http";

// Public, unauthenticated — the live catalog admins manage via /admin/products
// and /admin/categories. Shop pages fetch this instead of importing static
// seed data directly, so admin edits actually show up in the storefront.
export async function GET() {
  try {
    return NextResponse.json({ products: listProducts(), categories: listCategories() });
  } catch (err) {
    return errorResponse(err);
  }
}
