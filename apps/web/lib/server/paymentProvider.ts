import crypto from "node:crypto";

export interface PaymentIntentResult {
  id: string;
  clientSecret: string;
  status: string;
}

export type WebhookEventType = "payment_intent.succeeded" | "payment_intent.payment_failed" | "charge.refunded";

export interface NormalizedWebhookEvent {
  id: string;
  type: WebhookEventType;
  paymentIntentId: string;
  failureReason?: string;
}

export interface PaymentProvider {
  name: "stripe" | "mock";
  createPaymentIntent(params: { amountCents: number; currency: string; orderId: string }): Promise<PaymentIntentResult>;
  refund(paymentIntentId: string): Promise<{ id: string; status: string }>;
  /** Verifies the Stripe webhook signature and normalizes the event. Throws on an invalid signature. */
  verifyAndParseWebhook(rawBody: string, signature: string | null): NormalizedWebhookEvent;
}

// ---------------------------------------------------------------------------
// Mock provider — default when no Stripe keys are configured. Lets the full
// checkout → payment → webhook → order-status flow be exercised end-to-end
// without external credentials. The webhook-application logic it feeds into
// (lib/server/orderService.ts `applyPaymentEvent`) is IDENTICAL to what the
// real Stripe webhook route uses — only the "how do we learn the outcome"
// step differs (a direct call here vs. a signed HTTP callback from Stripe).
// ---------------------------------------------------------------------------
class MockPaymentProvider implements PaymentProvider {
  name = "mock" as const;

  async createPaymentIntent(_params: { amountCents: number; currency: string; orderId: string }): Promise<PaymentIntentResult> {
    const id = `pi_mock_${crypto.randomUUID()}`;
    return { id, clientSecret: `${id}_secret_mock`, status: "requires_payment_method" };
  }

  async refund(_paymentIntentId: string) {
    return { id: `re_mock_${crypto.randomUUID()}`, status: "succeeded" };
  }

  verifyAndParseWebhook(): NormalizedWebhookEvent {
    throw new Error("Mock provider has no real webhook endpoint — use /api/checkout/simulate-payment instead.");
  }
}

// ---------------------------------------------------------------------------
// Real Stripe provider — used automatically once STRIPE_SECRET_KEY is set.
// ---------------------------------------------------------------------------
class StripePaymentProvider implements PaymentProvider {
  name = "stripe" as const;
  private stripe: import("stripe").Stripe;

  constructor(secretKey: string) {
    // Lazily required so the `stripe` package is only touched when actually configured.
    const Stripe = require("stripe");
    this.stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });
  }

  async createPaymentIntent({ amountCents, currency, orderId }: { amountCents: number; currency: string; orderId: string }): Promise<PaymentIntentResult> {
    const intent = await this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: currency.toLowerCase(),
      metadata: { orderId },
      automatic_payment_methods: { enabled: true },
    });
    return { id: intent.id, clientSecret: intent.client_secret ?? "", status: intent.status };
  }

  async refund(paymentIntentId: string) {
    const refund = await this.stripe.refunds.create({ payment_intent: paymentIntentId });
    return { id: refund.id, status: refund.status ?? "unknown" };
  }

  verifyAndParseWebhook(rawBody: string, signature: string | null): NormalizedWebhookEvent {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !endpointSecret) {
      throw new Error("Missing Stripe signature or STRIPE_WEBHOOK_SECRET.");
    }
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as { id: string };
      return { id: event.id, type: "payment_intent.succeeded", paymentIntentId: intent.id };
    }
    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as { id: string; last_payment_error?: { message?: string } };
      return {
        id: event.id,
        type: "payment_intent.payment_failed",
        paymentIntentId: intent.id,
        failureReason: intent.last_payment_error?.message ?? "Card declined",
      };
    }
    if (event.type === "charge.refunded") {
      const charge = event.data.object as { payment_intent: string };
      return { id: event.id, type: "charge.refunded", paymentIntentId: charge.payment_intent };
    }
    throw new Error(`Unhandled Stripe event type: ${event.type}`);
  }
}

let singleton: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (singleton) return singleton;
  const secretKey = process.env.STRIPE_SECRET_KEY;
  singleton = secretKey ? new StripePaymentProvider(secretKey) : new MockPaymentProvider();
  return singleton;
}
