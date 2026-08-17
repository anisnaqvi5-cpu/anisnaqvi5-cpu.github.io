import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/server/adminAuth";
import { sectionsForRole } from "@/lib/server/permissions";

export async function GET() {
  const admin = getCurrentAdmin();
  if (!admin) return NextResponse.json({ authed: false });
  return NextResponse.json({
    authed: true,
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    sections: sectionsForRole(admin.role),
  });
}
