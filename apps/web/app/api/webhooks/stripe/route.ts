import { NextResponse } from "next/server";
import { applyPaymentEvent } from "@/lib/server/orderService";
import { getPaymentProvider } from "@/lib/server/paymentProvider";
import { logger } from "@/lib/server/logger";
import { rateLimitOrNull } from "@/lib/server/rateLimit";

// Real Stripe webhook endpoint. Configure this URL (…/api/webhooks/stripe)
// in the Stripe Dashboard once STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET are
// set. Reads the RAW body (required for signature verification — never
// req.json() here, since re-serializing would change the bytes Stripe signed).
export async function POST(req: Request) {
  const limited = rateLimitOrNull(req, { key: "webhook-stripe", limit: 100, windowMs: 60_000 });
  if (limited) return limited;

  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  const provider = getPaymentProvider();
  if (provider.name !== "stripe") {
    return NextResponse.json({ error: "not_configured", message: "Stripe is not configured on this deployment." }, { status: 400 });
  }

  try {
    const event = provider.verifyAndParseWebhook(rawBody, signature);
    await applyPaymentEvent(event);
    logger.info("stripe_webhook_processed", { eventId: event.id, type: event.type });
    // Always 200 once signature-verified and processed — Stripe retries on
    // non-2xx, and our processing is idempotent by event.id either way.
    return NextResponse.json({ received: true });
  } catch (err) {
    // An invalid signature or unparseable payload is the ONE case we reject
    // with a non-200 — it's not safe to acknowledge a webhook we couldn't verify.
    logger.error("stripe_webhook_verification_failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "webhook_verification_failed" }, { status: 400 });
  }
}
