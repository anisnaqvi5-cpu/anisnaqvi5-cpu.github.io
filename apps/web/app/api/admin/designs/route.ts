import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { readDb } from "@/lib/server/db";

// Read-only: shows the designs actually placed on orders (the frozen
// designSnapshot — see ECOMMERCE_SYSTEM.md "Personalization Linkage").
// Customers' unordered drafts stay browser-local/private by design; there is
// nothing server-side to show for those, and that's intentional.
export async function GET() {
  try {
    requireAdmin("designs");
    const designs = readDb((db) =>
      db.orderItems
        .filter((i) => i.designSnapshot && i.designSnapshot.length > 0)
        .map((i) => {
          const order = db.orders.find((o) => o.id === i.orderId);
          return { orderItem: i, orderNumber: order?.orderNumber ?? "", orderId: i.orderId, createdAt: order?.createdAt ?? "" };
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    );
    return NextResponse.json({ designs });
  } catch (err) {
    return errorResponse(err);
  }
}
