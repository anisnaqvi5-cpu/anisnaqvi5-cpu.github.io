# Admin Dashboard — Design & Implementation

> Reference: `ARCHITECTURE.md`, `DATABASE_SCHEMA.md` (`admin_users`, `audit_logs`), `ECOMMERCE_SYSTEM.md`, `WELLNESS_FEATURES.md`. Code: `apps/web/app/admin/**`, `apps/web/app/api/admin/**`, `apps/web/lib/server/*`.

---

## 1. Scope

The Admin Dashboard manages every domain the app has: **Products, Categories, Product Variants, Prices, Inventory, Customization Templates (Fonts, Quotes, Ordered Designs), Orders, Customers, Payments, Shipping, Coupons, Reviews, Wellness Content, Notifications**, plus **Analytics** and **role-based access control with an audit log**.

It builds directly on the catalog, order, and payment system in `ECOMMERCE_SYSTEM.md` — this document only covers what's new: turning the previously static/seed-only catalog and wellness content into **live, admin-editable data** (`lib/server/catalogService.ts`, `lib/server/contentService.ts`), and the **RBAC + audit logging** layer that governs every mutation.

---

## 2. Role-Based Access Control

### 2.1 Roles

| Role | Sections |
|---|---|
| **Super Admin** | Everything, including Admin Users & Roles and the Audit Log |
| **Product Manager** | Dashboard, Products, Categories, Customization, Designs, Coupons |
| **Order Manager** | Dashboard, Orders, Payments, Shipping, Returns, Customers |
| **Content Manager** | Dashboard, Reviews, Wellness Content, Notifications |

The full mapping lives in one place, `lib/server/permissions.ts` (`ROLE_SECTIONS`) — every admin API route calls `requireAdmin(section)` from `lib/server/adminAuth.ts`, which checks **both** "is this a valid session" and "does this role have this section," and throws (401/403) if not. **The permission check is server-side on every request** — the dashboard nav (`components/admin/AdminNav.tsx`) only hides links the current role can't use; it is not the enforcement, just a courtesy. A Content Manager calling `POST /api/admin/products` directly gets a real 403, not just a hidden button.

### 2.2 Authentication
- Real accounts (`AdminUserRecord`: email, name, **scrypt-hashed** password, role, active flag) — `lib/server/passwordHash.ts` uses Node's built-in `crypto.scryptSync` (no plaintext password ever stored, no external dependency needed).
- Login (`POST /api/admin/auth/login`) issues an opaque random session token (`crypto.randomUUID()`), stored server-side (`adminSessions`) with an 8-hour expiry, and set as an **httpOnly** cookie — the cookie itself carries no user data or role, so it can't be tampered with client-side to escalate privilege.
- `getCurrentAdmin()` re-resolves the full admin record (including current role) from the session token on **every** request — a role change or deactivation (§2.3) takes effect on the admin's very next request, not just their next login.

### 2.3 Demo Accounts
Seeded on first run (`lib/server/db.ts` `seedAdminUsers()`), one per role, all with password `wellness-admin-demo`:

| Email | Role |
|---|---|
| `super@wellness.demo` | Super Admin |
| `products@wellness.demo` | Product Manager |
| `orders@wellness.demo` | Order Manager |
| `content@wellness.demo` | Content Manager |

Super Admin can create additional admin accounts and change roles from **Admin Users & Roles** (`/admin/users`) — with one guard: an admin can never deactivate their own account (`lib/server/adminUserService.ts`), so there's always a way back in.

---

## 3. Audit Log

Every mutating admin action calls `logAudit(admin, action, entityType, entityId, note?)` (`lib/server/auditLog.ts`), recording **who** (admin id, email, role at the time of the action), **what** (`"product.update"`, `"order.refund"`, `"admin_user.role_change"`, …), **which entity**, and **when** — visible to Super Admins at `/admin/audit-log`. This covers login/logout, every product/category/coupon/content CRUD op, order status changes and refunds, review moderation, return approvals, and admin-user/role changes. The log is prepended (newest first) and capped at 2000 entries in this demo store; production hardening (§7) moves it to a proper indexed table with retention policy instead of a size cap.

---

## 4. Products, Categories, Variants, Prices, Inventory

These five items from the request map onto **one editing surface** (`/admin/products`, `components/admin/ProductEditor.tsx`) because that's how they're actually related: a product *has* variants, and each variant *is* where price (base price + variant delta) and inventory (`stockQty`) live — splitting them into five separate screens would just mean cross-referencing five tabs to edit one product.

- **Products/Categories** were previously static seed data (`lib/ecommerce/catalog.ts`) shared by both the client shop pages and the server order logic. They're now **live, server-authoritative data** in the same JSON store as orders (`lib/server/db.ts`), seeded once from that static file. `lib/server/catalogService.ts` is the only place that reads/writes them now.
- **Personalization print zones** are editable inline in the Product Editor (zone id, type text/color, label, max characters or color palette) — the same shape `CUSTOMIZATION_STUDIO.md` defines. This is a config editor, not the full drag-and-drop canvas studio described there; building that canvas UI is unchanged future work, and it would write to the exact same `printZones` field.
- **Variants** are added/edited/removed inline, each with SKU, label, price delta, and stock quantity. Deleting a product's last variant is blocked (`removeVariant` in `catalogService.ts`) — a product must always be purchasable if it's listed.

### 4.1 Shop now reads live data
`GET /api/shop/catalog` (public, unauthenticated) serves the admin-managed catalog. The shop's client pages (`/shop`, `/shop/products`, cart, checkout) fetch it once into a small store (`lib/useCatalogStore.ts`) with the static seed as an instant fallback while loading. The product detail page (`/shop/products/[slug]`) is a **server component** and reads the live catalog directly (`findProductBySlug`) — no round-trip needed since it's already server-side. **Net effect: editing a product's price or stock in the admin dashboard is immediately visible in the shop.**

---

## 5. Customization Templates, Fonts, Quotes, Designs

Grouped as **Customization Library** (`/admin/customization`):
- **Fonts** — a managed list (`FontRecord`) of font choices available in personalization text zones, each with an active/inactive toggle so a font can be retired without deleting history.
- **Quotes** — a managed prompt/message library (`QuoteRecord`, English + Arabic), tagged `motivational` or `gratitude` — feeds both the shop's text-personalization zones (e.g. the Motivational Gum Bag message) and, via the same underlying pattern, the wellness journal prompts (§6).
- **Designs** — a **read-only** gallery of designs customers actually **ordered** (the frozen `designSnapshot` on each order item — see `ECOMMERCE_SYSTEM.md` "Personalization Linkage"). Customers' unordered drafts are intentionally invisible here: they live only in the customer's browser (`lib/shopStore.ts`) until an order freezes them server-side, and that's a deliberate privacy boundary, not a missing feature.

---

## 6. Wellness Content

The wellness app's Fitness Planner, Mindfulness, and Gratitude Journal modules (`WELLNESS_FEATURES.md`) used to read only their bundled seed data (`apps/web/lib/wellness/seedData.ts`). That seed data is now **also** the initial content of three admin-managed collections (workouts, mindfulness sessions, gratitude prompts) served publicly via `GET /api/wellness/content` and managed at `/admin/wellness-content`.

The wellness pages fetch this live content on mount (`lib/wellness/useLiveContent.ts`) and use it in place of the static import — with the bundled seed as an instant fallback so nothing renders blank while the fetch is in flight. Concretely: the Fitness Planner's plan-generation algorithm (`generateFitnessPlan`, unchanged) now runs against whatever workouts the Content Manager has published; the Mindfulness session grid and the Gratitude Journal's daily prompt do the same.

---

## 7. Analytics Dashboard

`/admin` (the default landing page, visible to every role) computes, for a selectable window (7d / 30d / all-time):

| Metric | How it's computed |
|---|---|
| **Revenue** / **Net Revenue** | Sum of `totalCents` for orders that reached `paid` or later, minus refunded orders |
| **Orders** | Count of orders created in the window |
| **Average Order Value** | Revenue ÷ count of paid (non-refunded) orders |
| **Best-Selling Products** | Order items grouped by product, ranked by units sold |
| **New vs. Returning Customers** | Per distinct `customerId`: "new" if their *first-ever* order falls inside the window, "returning" if they already had an order before it |
| **Popular Customizations** | Most frequently chosen color values across every personalized order item's frozen design (a real, if narrow, proxy for "what do people actually customize") |
| **Conversion Metrics** | Payment success rate (succeeded ÷ succeeded+failed payment attempts), cancellation rate, return rate |

**A deliberate honesty note on "conversion metrics":** there is no storefront visitor/page-view tracking in this app, so a true visitor→purchase conversion rate cannot be computed — showing one would mean fabricating it. What's shown instead (payment success rate, cancellation rate, return rate) are real rates derived from actual order and payment records, and the dashboard says so explicitly rather than presenting a invented number as if it were traffic-based conversion.

---

## 8. Customers, Payments, Shipping, Coupons, Reviews

- **Customers** (`/admin/customers`) — there's no separate customer-account system yet (checkout uses a client-generated pseudo `customerId`, per `ECOMMERCE_SYSTEM.md`); "customers" here means every distinct `customerId` seen across orders, aggregated into spend/order-count/returning-status (`lib/server/customerService.ts`).
- **Payments** (`/admin/payments`) — every `PaymentRecord`, across both the mock and (once configured) real Stripe provider, with status and failure reason.
- **Shipping** (`/admin/shipping`) — orders in `paid` / `in_production` / `shipped`, linking to the order detail page where tracking number + carrier are captured (unchanged from `ECOMMERCE_SYSTEM.md`'s order-status workflow).
- **Coupons** (`/admin/coupons`) — full CRUD (percentage / fixed-amount / free-shipping, minimum order, active toggle) on what used to be a hardcoded three-entry list.
- **Reviews** (`/admin/reviews`) — **moderation queue**. Reviews now default to `pending` on submission (previously they went live immediately) and only `approved` reviews appear on the public product page. Approving/rejecting recomputes the product's public `avgRating`/`reviewCount` from approved reviews only, so a pending or rejected review never influences what shoppers see.

---

## 9. Notifications

`/admin/notifications` lets a Content Manager compose and "send" a broadcast (title, body, audience). No push infrastructure exists yet — same honesty principle as the analytics section: this logs what was composed and estimates reach from real customer counts (`lib/server/notificationService.ts`), rather than pretending to deliver an actual push notification. `ECOMMERCE_SYSTEM.md`'s "what's next" list is the place a real FCM/webhook integration would plug in.

---

## 10. Security Checklist

- [x] Passwords hashed with scrypt (`node:crypto`, salted, timing-safe comparison) — never stored or logged in plaintext
- [x] Session cookie is httpOnly, opaque, and carries no role/identity data client-side
- [x] Every admin API route re-checks the session AND the role's section permission server-side, not just the UI
- [x] Role/active-status changes take effect immediately (re-resolved from the DB on every request, not cached in the session)
- [x] An admin can never deactivate their own account (no accidental full lockout)
- [x] Every mutating action is audit-logged with actor, action, entity, and timestamp
- [x] Reviews are moderated before appearing publicly (pending → approved/rejected)
- [x] Refunds only ever happen through the dedicated, provider-calling refund action (unchanged from `ECOMMERCE_SYSTEM.md`) — never a bare status edit

---

## 11. What's Next

- Replace the JSON-file admin/session store with real Postgres/Supabase Auth (`admin_users` table already matches `DATABASE_SCHEMA.md`).
- Move the audit log to an indexed, retained table instead of the demo store's 2000-entry cap.
- Build the full drag-and-drop Customization Studio canvas (`CUSTOMIZATION_STUDIO.md`) on top of the print-zone config this dashboard now edits.
- Wire Notifications to a real push provider (FCM) once that infrastructure exists.

---

*This dashboard builds on `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `ECOMMERCE_SYSTEM.md`, and `WELLNESS_FEATURES.md`, and is implemented (not just designed) in `apps/web/app/admin`, `apps/web/app/api/admin`, and `apps/web/lib/server`.*
