import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { applyPaymentEvent } from "@/lib/server/orderService";
import { errorResponse } from "@/lib/server/http";
import { getPaymentProvider } from "@/lib/server/paymentProvider";

// Demo-only stand-in for a real Stripe payment confirmation + webhook
// delivery. Only available when no real Stripe keys are configured — once
// STRIPE_SECRET_KEY is set, this route refuses and the client instead uses
// Stripe.js + the real /api/webhooks/stripe route (see ECOMMERCE_SYSTEM.md).
export async function POST(req: Request) {
  try {
    const provider = getPaymentProvider();
    if (provider.name !== "mock") {
      return NextResponse.json({ error: "not_mock_mode", message: "A real payment provider is configured; use Stripe.js instead." }, { status: 400 });
    }

    const { paymentIntentId, outcome } = (await req.json()) as { paymentIntentId: string; outcome: "succeed" | "decline" };
    if (!paymentIntentId || !outcome) {
      return NextResponse.json({ error: "invalid_request", message: "paymentIntentId and outcome are required." }, { status: 400 });
    }

    await applyPaymentEvent(
      outcome === "succeed"
        ? { id: crypto.randomUUID(), type: "payment_intent.succeeded", paymentIntentId }
        : { id: crypto.randomUUID(), type: "payment_intent.payment_failed", paymentIntentId, failureReason: "Your card was declined (simulated)." }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
