"use client";

import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Real Stripe payment UI — used automatically once
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (client) and STRIPE_SECRET_KEY (server)
// are both configured. Card details never touch our server — Stripe.js
// tokenizes them directly with Stripe, keeping us out of PCI scope.
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null;

function InnerForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/shop/orders` },
      redirect: "if_required",
    });
    setSubmitting(false);
    if (confirmError) {
      // Failed payment: order stays pending_payment server-side (via the
      // eventual payment_intent.payment_failed webhook) — the customer can
      // retry here without a new order/charge being created.
      setError(confirmError.message ?? "Payment failed. Please try again.");
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <PaymentElement />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button disabled={!stripe || submitting} className="rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
        {submitting ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

export function StripePaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  if (!stripePromise) {
    return <p className="text-sm text-danger">Stripe publishable key not configured on this deployment.</p>;
  }
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerForm onSuccess={onSuccess} />
    </Elements>
  );
}
