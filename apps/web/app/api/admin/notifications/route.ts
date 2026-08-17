import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/adminAuth";
import { errorResponse } from "@/lib/server/http";
import { logAudit } from "@/lib/server/auditLog";
import { createBroadcast, listBroadcasts } from "@/lib/server/notificationService";
import type { NotificationBroadcast } from "@/lib/ecommerce/types";

export async function GET() {
  try {
    requireAdmin("notifications");
    return NextResponse.json({ broadcasts: listBroadcasts() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const admin = requireAdmin("notifications");
    const body = (await req.json()) as { title: string; body: string; audience: NotificationBroadcast["audience"] };
    const broadcast = await createBroadcast({ ...body, sentBy: admin.email });
    await logAudit(admin, "notification.broadcast", "notification_broadcast", broadcast.id, body.title);
    return NextResponse.json({ broadcast });
  } catch (err) {
    return errorResponse(err);
  }
}
