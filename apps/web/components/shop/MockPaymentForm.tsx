"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { shopApi } from "@/lib/shopApi";

// Demo payment UI — active by default (no Stripe keys required). Exercises
// the exact same server-side webhook-processing code path a real Stripe
// webhook would (lib/server/orderService.ts `applyPaymentEvent`); only the
// "how we learn the outcome" step is simulated. See ECOMMERCE_SYSTEM.md.
export function MockPaymentForm({ paymentIntentId, onSettled }: { paymentIntentId: string; onSettled: (outcome: "succeed" | "decline") => void }) {
  const [loading, setLoading] = useState<"succeed" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(outcome: "succeed" | "decline") {
    setLoading(outcome);
    setError(null);
    try {
      await shopApi.simulatePayment(paymentIntentId, outcome);
      onSettled(outcome);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm text-muted">
        <CreditCard size={16} /> Demo payment mode — no real card is charged
      </div>
      <div className="flex gap-2 rounded-lg border border-dashed border-border p-3 text-xs text-muted">
        4242 4242 4242 4242 · 12/34 · 123 <span className="ml-auto italic">(illustrative — no input needed)</span>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={() => run("succeed")}
          disabled={loading !== null}
          className="flex-1 rounded-pill bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading === "succeed" ? "Processing..." : "Simulate Successful Payment"}
        </button>
        <button
          onClick={() => run("decline")}
          disabled={loading !== null}
          className="flex-1 rounded-pill border border-danger py-2 text-sm font-medium text-danger disabled:opacity-50"
        >
          {loading === "decline" ? "Processing..." : "Simulate Decline"}
        </button>
      </div>
    </div>
  );
}
