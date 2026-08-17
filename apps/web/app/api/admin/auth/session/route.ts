import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/adminAuth";
import { sectionsForRole } from "@/lib/server/permissions";
import { errorResponse } from "@/lib/server/http";

export async function GET() {
  try {
    const admin = getCurrentAdmin();
    if (!admin) return NextResponse.json({ authed: false });
    return NextResponse.json({
      authed: true,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      sections: sectionsForRole(admin.role),
    });
  } catch (err) {
    return errorResponse(err);
  }
}
