# E-commerce System — Design & Implementation

> Reference: `ARCHITECTURE.md`, `DATABASE_SCHEMA.md` (commerce domain tables), `CUSTOMIZATION_STUDIO.md` (personalization architecture), `WELLNESS_FEATURES.md` (the local-first pattern this system deliberately does NOT use for orders/payments — see §1). Code: `apps/web/app/shop/**`, `apps/web/app/admin/**`, `apps/web/app/api/**`.

---

## 1. The One Architectural Rule That Shapes Everything Here

**Orders and payments are money. Money is never client-authoritative.**

The wellness modules (`WELLNESS_FEATURES.md`) are intentionally browser-local — journaling data never needs a server to trust it. Commerce is the opposite case: a Stripe webhook arrives from Stripe's servers with no browser attached, prices must never be trusted from the client, and two clicks on "Place Order" must never become two charges. All of that requires a real server-side source of truth.

This implementation adds `apps/web/lib/server/*` — genuine server-side code (Next.js Route Handlers), backed by a small JSON-file store (`lib/server/db.ts`) instead of Postgres/Supabase, for the same reason the wellness store is local-first: no external infrastructure or billing setup required to run and test this demo. The difference from the wellness case is that this module is **server-side** (reachable by a webhook, invisible to the browser), which is what actually matters architecturally. `DATABASE_SCHEMA.md`'s `orders` / `order_items` / `payments` / `return_requests` tables are the production target — swapping `lib/server/db.ts`'s internals for real SQL queries is a drop-in change; nothing that calls into it (`lib/server/orderService.ts`) needs to change.

Everything that *isn't* money — catalog browsing, cart, wishlist, design drafts — stays client-local in `lib/shopStore.ts`, exactly like the wellness pattern.

---

## 2. Personalization Linkage (the explicit requirement)

> "Personalized product کے لیے cart میں صرف product ID کافی نہیں ہوگا؛ customer کا exact saved design بھی order item سے correctly linked ہونا چاہیے۔"

This is enforced at three layers, matching `CUSTOMIZATION_STUDIO.md`'s design:

1. **Cart** (`lib/ecommerce/types.ts` `CartItem`): `{ variantId, designId?, quantity }` — a personalized cart line carries a `designId` pointing at a `SavedDesign` (`lib/shopStore.ts`), never just the product.
2. **Order creation** (`lib/server/orderService.ts` `createOrder`): the client sends the *resolved* design (`{ productId, elements }`) alongside each cart item. The server validates every element against the product's `printZones` (unknown zone → rejected; text over `maxChars` → rejected) and then **freezes** it into `OrderItemRecord.designSnapshot` — an immutable copy stored on the order item itself, not a reference back to the mutable `SavedDesign`.
3. **Immutability guarantee**: because `designSnapshot` is a copy taken at order time, a customer editing or deleting their saved design later never changes what's on a placed order — the exact design that was paid for is what gets produced. This mirrors `DATABASE_SCHEMA.md`'s `order_items.design_snapshot jsonb` column exactly.

The two personalizable-item guards in `createOrder` are worth calling out: an order for a personalizable product with **no** design attached is rejected (`design_required`), and stock/price are still recomputed server-side per line — personalization never bypasses the "never trust the client" rule for money.

---

## 3. Stripe Integration Architecture

### 3.1 Provider abstraction (`lib/server/paymentProvider.ts`)
```
interface PaymentProvider {
  name: "stripe" | "mock";
  createPaymentIntent(...): Promise<{ id, clientSecret, status }>;
  refund(paymentIntentId): Promise<{ id, status }>;
  verifyAndParseWebhook(rawBody, signature): NormalizedWebhookEvent; // throws if invalid
}
```
`getPaymentProvider()` returns the real `StripePaymentProvider` the moment `STRIPE_SECRET_KEY` is set in the environment; otherwise it returns `MockPaymentProvider`, which is what this demo runs on by default (no external account needed to fully exercise checkout → payment → order-status).

### 3.2 Card data never touches our server
The client uses `@stripe/react-stripe-js`'s `PaymentElement` (`components/shop/StripePaymentForm.tsx`), which tokenizes card details directly with Stripe. Our server only ever sees a `PaymentIntent` id — this keeps the app out of PCI-DSS card-data scope, per `ARCHITECTURE.md` §8.

### 3.3 Checkout flow (both modes)
```
Client                    Server (/api/checkout/*)              Stripe
  │  POST create-order  ─────▶  recompute prices/stock/coupon
  │                             create Order (pending_payment)
  │                             createPaymentIntent() ───────────▶ PaymentIntent created
  │  ◀── { order, clientSecret, provider } ─────
  │
  │  [stripe mode] confirmPayment() via Stripe.js ─────────────────▶ card charged
  │  [mock mode]   POST simulate-payment (succeed/decline)
  │                             applyPaymentEvent() directly
  │                                                          Stripe ──▶ POST /api/webhooks/stripe
  │                                                                     verifyAndParseWebhook()
  │                                                                     applyPaymentEvent()
  │  (poll/redirect) GET order  ─────▶ status now "paid"
```
The mock path and the real webhook path both terminate in the **same function**, `applyPaymentEvent()` — the only thing that differs is how the outcome is learned (a direct call vs. a signed HTTP callback). This means the order-status logic is exercised identically in both modes; nothing about "how orders react to payment outcomes" is mock-only code.

### 3.4 Webhook handling (`app/api/webhooks/stripe/route.ts`)
- Reads the **raw** request body (`req.text()`, never `req.json()`) — Stripe's signature covers the exact bytes sent, and re-serializing JSON can change them.
- `stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)` verifies the signature; an invalid signature is the **only** case the route responds with a non-200, since it's not safe to acknowledge a webhook whose authenticity we couldn't confirm.
- Every other outcome — including "we don't recognize this PaymentIntent" — still returns 200, so Stripe doesn't retry-storm us for events irrelevant to this app.
- **Idempotency**: `db.processedWebhookEventIds` records each Stripe event id before it's applied. Stripe redelivers events (network retries, manual redelivery); a duplicate `event.id` is a silent no-op, never a double status transition or double notification.

### 3.5 Failed payments
`payment_intent.payment_failed` sets `payment.status = "failed"` with the decline reason, but **leaves the order at `pending_payment`** — a declined card is not a reason to cancel the order or lose the customer's cart. The checkout UI (`app/shop/checkout/page.tsx`) surfaces the failure and lets the customer retry immediately, reusing the *same* order and the *same* `PaymentIntent` (a `PaymentIntent` supports multiple confirmation attempts). No new order is created on retry.

### 3.6 Duplicate-order prevention (idempotency)
`useShopStore.startCheckout()` generates one `idempotencyKey` (UUID) when the customer enters checkout and holds onto it for the whole attempt — including retries after a failed payment or a network hiccup on `create-order` itself. `createOrder()` server-side checks for an existing order with that key **before** creating anything; if found, it returns the existing order instead of creating a duplicate. The key is only cleared (`clearCheckout()`) after a payment actually succeeds. This covers the two realistic duplication vectors: a user double-clicking "Place Order," and a client retrying a timed-out request.

### 3.7 Refunds
Admin-triggered (`adminRefundOrder`) or return-triggered (`adminResolveReturn` on approval) refunds call `provider.refund(paymentIntentId)` — a real Stripe refund API call in Stripe mode, a simulated success in mock mode — then set `payment.status = "refunded"` and `order.status = "refunded"`, logged into `statusHistory`. A `charge.refunded` webhook event is also handled defensively (idempotent, same as any other event) in case a refund is issued directly from the Stripe Dashboard rather than through this app.

---

## 4. Order Status Management

### 4.1 State machine (`lib/server/orderService.ts VALID_TRANSITIONS`)
```
pending_payment ──▶ paid ──▶ in_production ──▶ shipped ──▶ delivered
       │              │                                       │
       └──▶ cancelled ─┘                                      └──▶ (return window)
                        └──────────────────────▶ refunded ◀───────┘
```
- `pending_payment → paid`: only via a successful payment event (webhook/simulate), never a direct admin click — the admin status dropdown deliberately excludes transitions that should only ever be payment-driven.
- `→ cancelled`: customer- or admin-initiated, only while `pending_payment` or `paid` (once production has started, cancellation is no longer safe — see §5).
- `→ refunded`: **only** through the dedicated refund action (§3.7), never the generic status-update endpoint — refunding must always call the payment provider, so it's not exposed as a plain dropdown option.
- Every transition is validated server-side against this table (`adminUpdateOrderStatus`, `cancelOrder`) — an invalid transition throws `invalid_transition` rather than silently applying.
- Every transition appends to `order.statusHistory` — this **is** the audit log and what both the customer tracking page and the admin detail page render as a timeline.

### 4.2 Cancellations (`POST /api/orders/:id/cancel`)
Customer-facing, restricted to `pending_payment` / `paid` orders and to the order's own `customerId`. Sets `status = cancelled` with a history entry; a paid-but-not-yet-shipped cancellation is expected to be followed by an admin refund (not automatic, so a human can decide fulfillment-cost handling).

### 4.3 Returns (`POST /api/orders/:id/return`)
Restricted to `delivered` orders, within a 14-day window measured from the `delivered` status-history entry (not `createdAt`). Creates a `ReturnRequest` (`requested` status) — it does **not** change the order's status; an admin must approve or reject it (`app/admin/returns`). Approval triggers the same refund path as §3.7.

---

## 5. Admin Order-Management Workflow

1. **Login** (`/admin/login`) — passcode-gated (`ADMIN_PASSCODE` env var, default `wellness-admin-demo`), sets an `httpOnly` session cookie. This stands in for the real `admin_users` role check (`ARCHITECTURE.md` §7 / `DATABASE_SCHEMA.md` `admin_users`) without building full auth for the demo — every admin API route (`isAdminAuthed()`) rejects unauthenticated requests regardless of what the UI shows.
2. **Orders list** (`/admin/orders`) — filterable by status (the same tabs as the state machine), each row linking to detail.
3. **Order detail** (`/admin/orders/:id`) — shows the frozen `designSnapshot` per personalized line item (so fulfillment sees exactly what to produce, not a live/mutable design), a status-transition control limited to valid next states, a tracking-number/carrier capture when moving to `shipped`, and a refund action.
4. **Returns queue** (`/admin/returns`) — every pending `ReturnRequest` with Approve (→ refund) / Reject actions.

---

## 6. Payment Security Checklist

- [x] Card data never reaches our server (Stripe Elements tokenizes client-side)
- [x] Prices/stock/coupons recomputed server-side on every order — client numbers are advisory only (used for the pre-checkout preview UI)
- [x] Webhook signature verified before any event is trusted; raw body used for verification
- [x] Webhook processing idempotent by `event.id`
- [x] Order creation idempotent by client-generated `idempotencyKey`
- [x] Refunds only via a dedicated, provider-calling action — never a bare status edit
- [x] Admin routes require an authenticated session on every request (not just UI-gated)
- [x] Design content is validated server-side against the product's own print-zone rules before being frozen into an order

---

## 7. What's Next (production hardening)

- Swap `lib/server/db.ts` for Postgres/Supabase with the `DATABASE_SCHEMA.md` schema + Row Level Security; `orderService.ts`'s function signatures don't need to change.
- Replace the passcode admin gate with real Supabase Auth + `admin_users.admin_role`.
- Add Stripe's `automatic_payment_methods` regional configuration and 3-D Secure handling (already flows through `confirmPayment({ redirect: "if_required" })`, but needs a return-URL page to resume after an off-site auth challenge).
- Move `processedWebhookEventIds` retention to a TTL'd table (currently unbounded) once on real infrastructure.

---

*This system builds on `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, and `CUSTOMIZATION_STUDIO.md`, and is implemented (not just designed) in `apps/web/app/shop`, `apps/web/app/admin`, and `apps/web/app/api`.*
