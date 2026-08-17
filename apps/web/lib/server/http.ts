import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { OrderError } from "@/lib/server/errors";
import { AdminAuthError } from "@/lib/server/adminAuth";
import { logger } from "@/lib/server/logger";

export function getCustomerId(req: Request): string {
  const id = req.headers.get("x-customer-id");
  if (!id) throw new OrderError("missing_customer", "Missing X-Customer-Id header.");
  return id;
}

function statusForCode(code: string): number {
  switch (code) {
    case "not_found":
      return 404;
    case "invalid_transition":
    case "not_cancellable":
    case "not_returnable":
    case "return_window_closed":
    case "already_reviewed":
    case "invalid_review":
    case "out_of_stock":
      return 409;
    case "missing_customer":
      return 401;
    default:
      return 400;
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof AdminAuthError) {
    return NextResponse.json({ error: "forbidden", message: err.message }, { status: err.status });
  }
  if (err instanceof OrderError) {
    return NextResponse.json({ error: err.code, message: err.message }, { status: statusForCode(err.code) });
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      { error: "invalid_request", message: "Request failed validation.", issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 400 }
    );
  }
  logger.error("unhandled_api_error", { error: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined });
  return NextResponse.json({ error: "internal_error", message: "Something went wrong." }, { status: 500 });
}
