import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPasscode } from "@/lib/server/adminAuth";

export async function POST(req: Request) {
  const { passcode } = (await req.json()) as { passcode: string };
  if (!checkPasscode(passcode)) {
    return NextResponse.json({ error: "invalid_passcode", message: "Incorrect passcode." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "granted", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return res;
}
