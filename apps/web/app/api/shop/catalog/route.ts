import { NextResponse } from "next/server";
import { listCategories, listProducts } from "@/lib/server/catalogService";

// Public, unauthenticated — the live catalog admins manage via /admin/products
// and /admin/categories. Shop pages fetch this instead of importing static
// seed data directly, so admin edits actually show up in the storefront.
export async function GET() {
  return NextResponse.json({ products: listProducts(), categories: listCategories() });
}
