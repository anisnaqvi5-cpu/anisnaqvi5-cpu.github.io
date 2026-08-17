import { NextResponse } from "next/server";
import { OrderError } from "@/lib/server/errors";
import { AdminAuthError } from "@/lib/server/adminAuth";

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
  // eslint-disable-next-line no-console
  console.error(err);
  return NextResponse.json({ error: "internal_error", message: "Something went wrong." }, { status: 500 });
}
