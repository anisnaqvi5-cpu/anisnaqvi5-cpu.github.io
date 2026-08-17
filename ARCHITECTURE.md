# Personalized Wellness E-commerce + Wellness Tracking App
## مکمل Technical Architecture Document

> **Status:** صرف architecture/design — کوئی implementation ابھی شروع نہیں کی گئی۔
> یہ document project کا blueprint ہے تاکہ implementation phase میں ٹیم/AI کسی confusion کے بغیر build کر سکے۔

---

## 1. Product Overview

یہ ایک **hybrid platform** ہے — e-commerce store اور wellness tracking app کا ملاپ:

| Category | Modules |
|---|---|
| **Commerce** | Product catalog, personalization studio, cart, checkout, payments, order tracking |
| **Wellness Ecosystem** | Fitness tracking, hydration tracking, gratitude/mindfulness journaling, personalized wellness plans |
| **Platform** | User profile, authentication, admin dashboard, notifications |

**Products (6 SKU categories, ہر ایک customizable):**
1. Personalized Yoga Mats (name/pattern/color print)
2. Custom Fitness Trackers / Planners (cover design, name embossing)
3. Essential Oil Diffusers (color/engraving)
4. Motivational Gum Bags (custom text/message packaging)
5. Gratitude / Mindfulness Journals (cover personalization, prompts selection)
6. Hydration Tracking Water Bottles (name/color/goal markings)

**Core insight:** یہ صرف ایک store نہیں — خریداری کے بعد بھی user کو ecosystem میں engaged رکھنا ہے (تاکہ retention اور repeat purchase بڑھے)۔ اسی لیے wellness tracking اور commerce ایک ہی user profile اور data model میں tightly integrated ہونے چاہئیں (مثلاً: hydration tracker app کے اندر ہی "buy matching water bottle" suggestion)۔

---

## 2. Recommended Tech Stack

### 2.1 Frontend
| Layer | Choice | وجہ |
|---|---|---|
| Framework | **Next.js 14+ (React, TypeScript, App Router)** | SSR/SSG for SEO on product pages, API routes, image optimization |
| Mobile | **PWA first** → بعد میں **React Native (Expo)** app | ایک ہی codebase logic (React) reuse ہو سکتی ہے |
| Styling | **Tailwind CSS + shadcn/ui** | fast, consistent design system |
| State mgmt | **Zustand** (client state) + **TanStack Query** (server state/caching) | cart, personalization draft state local رہے، server data cached رہے |
| Live Preview / Customization | **Konva.js / Fabric.js** (2D canvas — text, image, color overlay) + **Three.js/react-three-fiber** (صرف yoga mat جیسے 3D-preview والے items کے لیے، optional) | real-time drag/drop, text, color customization |
| Forms | React Hook Form + Zod | validation |
| Charts (fitness/hydration) | Recharts / Visx | tracking dashboards |

### 2.2 Backend
**Recommended: Supabase (Postgres + Auth + Storage + Edge Functions) as primary backend**, with option to migrate to custom **NestJS** service later اگر complex business logic (order orchestration, inventory sync) بڑھ جائے۔

| Layer | Choice |
|---|---|
| Database | **PostgreSQL** (via Supabase) |
| API layer | Supabase auto-generated REST/GraphQL (PostgREST) + **custom Edge Functions (Deno/TypeScript)** for business logic (checkout, order state machine, personalization save) |
| Alternative / scale-up path | **NestJS (Node.js + TypeScript)** monolith-first → modular monolith → microservices جب scale کی ضرورت ہو |
| Background jobs / queues | Supabase Cron / **BullMQ + Redis** (order processing, email, notification jobs) |
| Caching | Redis (product catalog, session cache) |
| Realtime | Supabase Realtime (order status live updates, live preview collab اگر future میں چاہیے) |

### 2.3 Auth
- **Supabase Auth** — Email/Password, Google/Apple OAuth, Phone OTP (Pakistan audience کے لیے مفید)
- JWT-based session, Row Level Security (RLS) database میں enforce ہو گی

### 2.4 Payments
- **Stripe** (international cards)
- **Local gateway integration**: JazzCash / Easypaisa / PayFast / HBL PayPlus (COD بھی — Pakistan e-commerce میں COD critical ہے)
- **Cash on Delivery (COD)** as first-class payment method (MVP کے لیے شاید سب سے زیادہ used)

### 2.5 File / Image Storage
- **Supabase Storage** (S3-compatible) — product images, user-uploaded personalization images/photos, generated preview mockups
- **Cloudflare CDN / Images** — image optimization, resizing, delivery
- Buckets: `product-assets` (public), `user-uploads` (private, per-user RLS), `personalization-renders` (generated previews), `order-proofs` (final print files for fulfillment)

### 2.6 Hosting / Infra
- Frontend: **Vercel**
- Backend: **Supabase Cloud** (managed Postgres/Auth/Storage)
- CDN: Cloudflare
- Monitoring: Sentry (errors) + Supabase Logs + Vercel Analytics
- Email/SMS: Resend / SendGrid (email), Twilio or local SMS gateway (order updates)
- Push notifications: Firebase Cloud Messaging (mobile reminders — hydration/journal/workout)

> **نوٹ:** موجودہ repo (`anisnaqvi5-cpu.github.io`) ایک static **GitHub Pages** site ہے۔ GitHub Pages صرف static hosting دیتا ہے (کوئی server-side API/DB نہیں چل سکتا)۔ اس project کے لیے یہ صرف **marketing/landing page** کے طور پر استعمال ہو سکتا ہے۔ اصل app (dynamic, authenticated, database-backed) کے لیے Vercel/Supabase جیسا hosting چاہیے ہو گا — implementation phase میں یہ decision confirm کر لیں۔

---

## 3. High-Level System Architecture

```
                                ┌───────────────────────────┐
                                │        Client Apps         │
                                │  Web (Next.js) / PWA / RN  │
                                └──────────────┬─────────────┘
                                               │ HTTPS/REST + Realtime WS
                     ┌─────────────────────────┼─────────────────────────┐
                     │                          │                          │
             ┌───────▼────────┐        ┌───────▼────────┐        ┌───────▼────────┐
             │  Supabase Auth │        │ API Layer        │        │ Supabase       │
             │  (JWT/OAuth)   │        │ (PostgREST +      │        │ Storage (S3)   │
             │                │        │  Edge Functions)  │        │                │
             └───────┬────────┘        └───────┬────────┘        └───────┬────────┘
                     │                          │                          │
                     └─────────────┬────────────┴─────────────┬────────────┘
                                    │                          │
                          ┌─────────▼─────────┐      ┌─────────▼─────────┐
                          │   PostgreSQL DB    │      │  Redis (cache/     │
                          │   (RLS enabled)    │      │  queues - BullMQ)  │
                          └─────────┬─────────┘      └─────────┬─────────┘
                                    │                          │
                     ┌──────────────┼──────────────────────────┼──────────────┐
                     │              │                          │              │
             ┌───────▼──────┐ ┌────▼─────────┐        ┌───────▼──────┐ ┌─────▼─────┐
             │ Payment       │ │ Notification  │        │ Fulfillment/  │ │ Analytics │
             │ Gateways      │ │ Service       │        │ Print-on-     │ │ (events)  │
             │ (Stripe/      │ │ (Email/SMS/   │        │ Demand /      │ │           │
             │ JazzCash/COD) │ │ Push)         │        │ Vendor API    │ │           │
             └──────────────┘ └──────────────┘        └──────────────┘ └───────────┘
```

---

## 4. Frontend Architecture

### 4.1 App Structure (Next.js App Router)
```
apps/web/
├── app/
│   ├── (marketing)/                 # public landing pages
│   │   ├── page.tsx
│   │   └── about/
│   ├── (shop)/
│   │   ├── products/
│   │   │   ├── page.tsx             # catalog/listing
│   │   │   └── [slug]/page.tsx      # product detail + personalization
│   │   ├── customize/[productId]/   # live customization studio
│   │   ├── cart/page.tsx
│   │   └── checkout/page.tsx
│   ├── (wellness)/                  # requires auth
│   │   ├── dashboard/page.tsx       # unified wellness home
│   │   ├── fitness/
│   │   ├── hydration/
│   │   ├── journal/
│   │   └── plans/
│   ├── (account)/
│   │   ├── profile/
│   │   ├── orders/
│   │   └── settings/
│   ├── (admin)/                     # role-protected
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── users/
│   └── api/                         # thin BFF routes (webhooks, server actions)
├── components/
│   ├── ui/                          # shadcn primitives
│   ├── shop/
│   ├── customizer/                  # canvas engine components
│   └── wellness/
├── lib/
│   ├── supabase/                    # client + server clients
│   ├── stripe/
│   └── validators/                  # zod schemas
├── stores/                          # zustand stores (cart, customizer draft)
└── hooks/
```

### 4.2 Key Frontend Modules
- **Product Customizer Engine**: reusable canvas component جو کسی بھی product type کے لیے configurable ہو (config-driven: text layers, image layers, color swatches, print-area bounds per product)
- **Cart/Checkout**: persisted client state (Zustand + localStorage) + server sync on login
- **Wellness Dashboard**: modular widgets (hydration ring, journal streak, fitness summary, today's plan) — composable, lazy-loaded

---

## 5. Backend Architecture

### 5.1 Modules (logical boundaries — چاہے monolith ہو یا microservice، یہی domain boundaries رکھیں)

1. **Identity** — users, roles, profile
2. **Catalog** — products, variants, personalization options, inventory
3. **Personalization** — design drafts, saved templates, render jobs
4. **Cart & Order** — cart, checkout, order lifecycle, payments
5. **Fulfillment** — vendor/print-on-demand integration, shipping, tracking
6. **Wellness** — fitness logs, hydration logs, journal entries, plans, streaks
7. **Notification** — email/SMS/push triggers
8. **Admin/Ops** — dashboards, reports, moderation

### 5.2 Business Logic Placement
- **Simple CRUD** (read products, read journal entries) → direct Postgres access via PostgREST + RLS (client-safe)
- **Business rules** (checkout, inventory decrement, order state transitions, personalization file generation, wellness streak calc, plan generation) → **Edge Functions** (server-only, service-role key, never exposed to client)

### 5.3 Order State Machine
```
CART → PENDING_PAYMENT → PAID/COD_CONFIRMED → IN_PRODUCTION (personalized items)
     → READY_TO_SHIP → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
     (any stage) → CANCELLED / REFUNDED
```
ہر transition ایک **audit log row** بناتی ہے (`order_status_history`) اور متعلقہ notification trigger کرتی ہے۔

### 5.4 Background Jobs (Queue)
- Order confirmation email/SMS
- Personalization render (product mockup generate) — async job, cart/checkout پر block نہ کرے
- Daily wellness reminder push (hydration/journal streak)
- Weekly wellness plan regeneration
- Abandoned cart recovery email

---

## 6. Database Architecture (PostgreSQL)

### 6.1 Core Schema (ERD summary)

**Identity**
- `users` (id, email, phone, role[customer/admin/staff], created_at)
- `profiles` (user_id FK, name, avatar_url, dob, gender, wellness_goals jsonb)

**Catalog**
- `products` (id, sku_type[yoga_mat/tracker/diffuser/gum_bag/journal/bottle], title, description, base_price, images[], is_personalizable, print_area_config jsonb)
- `product_variants` (id, product_id FK, size, color, stock_qty, price_delta)
- `personalization_options` (id, product_id FK, option_type[text/image/color/pattern], constraints jsonb)

**Personalization**
- `design_drafts` (id, user_id FK, product_id FK, layers jsonb, preview_image_url, status[draft/saved/ordered])
- `design_templates` (id, product_id FK, name, layers jsonb, is_public) — reusable presets

**Cart & Orders**
- `carts` (id, user_id FK, status)
- `cart_items` (id, cart_id FK, product_variant_id FK, design_draft_id FK nullable, qty, unit_price)
- `orders` (id, user_id FK, status, subtotal, shipping_fee, tax, total, payment_method, shipping_address jsonb, placed_at)
- `order_items` (id, order_id FK, product_variant_id FK, design_snapshot jsonb, qty, unit_price, fulfillment_status)
- `order_status_history` (id, order_id FK, status, note, changed_at)
- `payments` (id, order_id FK, provider, provider_ref, amount, status)

**Fulfillment**
- `shipments` (id, order_id FK, carrier, tracking_number, status, eta)
- `vendor_jobs` (id, order_item_id FK, vendor_name, external_job_id, status) — print-on-demand/manufacturing partner sync

**Wellness**
- `fitness_logs` (id, user_id FK, activity_type, duration_min, calories, logged_at)
- `hydration_logs` (id, user_id FK, amount_ml, logged_at, daily_goal_ml)
- `journal_entries` (id, user_id FK, prompt, content, mood, gratitude_items[], created_at)
- `wellness_plans` (id, user_id FK, plan_type, goals jsonb, weekly_schedule jsonb, active)
- `streaks` (id, user_id FK, streak_type[hydration/journal/fitness], current_count, longest_count, last_logged_at)

**Admin/Ops**
- `audit_logs` (id, actor_id, action, entity, entity_id, meta jsonb, created_at)
- `coupons`, `inventory_alerts`, `reviews`

### 6.2 Data Access Rules
- **Row Level Security (RLS)** ہر user-owned table پر enforce: `user_id = auth.uid()`
- Admin role bypass via dedicated service-role policies
- Foreign keys + `ON DELETE CASCADE` جہاں appropriate (draft/journal ownership)، `ON DELETE RESTRICT` orders/payments پر (financial integrity)

---

## 7. Authentication & Authorization

- **AuthN**: Supabase Auth (JWT) — email/password, Google/Apple OAuth, phone OTP
- **AuthZ**: Role-based (`customer`, `staff`, `admin`) via `users.role` + Postgres RLS policies + Edge Function middleware checks
- Session: short-lived JWT + refresh token (Supabase handles rotation)
- Sensitive admin actions: additional server-side role check (never trust client-sent role)
- MFA optional for admin accounts (recommended for production)

---

## 8. Payment Architecture

```
Client → Checkout Review → create_order (Edge Function, status=PENDING_PAYMENT)
                                 │
                ┌────────────────┼─────────────────┐
                ▼                ▼                  ▼
           Stripe Checkout   JazzCash/Easypaisa   Cash on Delivery
           (redirect/intent)  (redirect/API)       (no gateway)
                │                │                  │
                └──── webhook ───┴──── webhook ──────┘
                              │
                    Edge Function: verify signature →
                    update payments + orders.status = PAID
                              │
                    trigger: fulfillment job + notification
```

**اصول:**
- کبھی بھی card data اپنے server پر store نہ کریں — Stripe Elements/hosted checkout استعمال کریں (PCI-DSS scope minimize)
- تمام payment status updates **webhook-driven** ہوں، client-side confirmation پر کبھی order کو "paid" mark نہ کریں
- Idempotency keys استعمال کریں duplicate charge سے بچنے کے لیے
- Refund flow: admin-triggered → gateway API call → `payments.status = refunded` → notify user

---

## 9. Product Personalization Architecture

### 9.1 Flow
```
1. User selects product → opens Customizer
2. Customizer loads product's `print_area_config` (allowed zones, max text length, fonts, color palette)
3. User edits layers (text/image/color) on canvas (Konva.js) — pure client-side, real-time preview
4. On "Save Design" → draft saved to `design_drafts` (layers as JSON + generated preview PNG uploaded to Storage)
5. Draft added to cart (`cart_items.design_draft_id`)
6. On order placement → `design_snapshot` frozen into `order_items` (immutable — future draft edits نہ ہوں order کو affect نہ کریں)
7. Fulfillment job: high-res render generate (server-side, via headless canvas/Sharp) → print-ready file → vendor_jobs
```

### 9.2 Config-Driven Design (important architectural decision)
ہر product type کے لیے hardcoded customizer نہ بنائیں۔ ایک **generic canvas engine** بنائیں جو `print_area_config` JSON پڑھ کر layers render کرے:
```json
{
  "canvas": { "width": 800, "height": 1200, "bg_image": "url" },
  "print_zones": [
    { "id": "name_text", "type": "text", "x": 100, "y": 400, "max_chars": 20, "fonts": ["Poppins","Amiri"] },
    { "id": "pattern", "type": "color_fill", "options": ["#F5E6D3","#B8D8D8"] }
  ]
}
```
اس سے نئے products add کرنا صرف admin panel سے config بنانے جتنا آسان ہو جاتا ہے — کوئی نیا frontend code نہیں چاہیے۔

---

## 10. Order / Fulfillment Architecture

- **In-house stock items** (bottles, oils diffusers pre-made) → warehouse pick-pack-ship (admin marks shipped, tracking manually/API se add)
- **Personalized/print-on-demand items** (yoga mats, journals, planners) → `vendor_jobs` table کے ذریعے 3rd-party print/manufacturing partner API سے integrate (اگر partner ہو) یا internal production queue (اگر خود print کریں)
- Shipping: local courier API integration (TCS/Leopards/M&P — Pakistan courier options) for tracking number generation + webhook status updates
- Order tracking page: `order_status_history` + `shipments.tracking_number` سے real-time status دکھائے (Supabase Realtime subscription)

---

## 11. Admin Dashboard Architecture

Separate route group (`/admin`) same Next.js app میں (role-gated) — یا future میں الگ app۔

**Modules:**
- **Overview**: sales, active users, top products, wellness engagement metrics
- **Product Management**: CRUD products/variants, personalization config editor
- **Order Management**: order list/filter, status update, refund trigger, fulfillment assignment
- **Inventory**: stock levels, low-stock alerts
- **Users**: customer list, roles, support notes
- **Content**: wellness plan templates, journal prompts library
- **Reports**: revenue, personalization popularity, wellness feature usage (retention insight)

Access control: `role = admin/staff` + RLS policies + server-side guard on every admin Edge Function.

---

## 12. API Structure

### Pattern
- **Auto-generated (PostgREST via Supabase)**: read-heavy, RLS-protected — `GET /rest/v1/products`, `GET /rest/v1/journal_entries?user_id=eq.<id>`
- **Custom Edge Functions**: business-logic endpoints (namespaced `/functions/v1/...`)

### Key Custom Endpoints
```
POST   /functions/v1/cart/add-item
POST   /functions/v1/checkout/create-order
POST   /functions/v1/checkout/confirm-payment      (webhook)
POST   /functions/v1/personalization/save-draft
POST   /functions/v1/personalization/render        (generate print-ready file)
GET    /functions/v1/orders/:id/track
POST   /functions/v1/wellness/hydration/log
POST   /functions/v1/wellness/fitness/log
POST   /functions/v1/wellness/journal/entry
POST   /functions/v1/wellness/plans/generate
POST   /functions/v1/admin/orders/:id/update-status
POST   /functions/v1/admin/products
```
Versioning: `/v1/` prefix سے شروع، future breaking changes کے لیے `/v2/`۔
Auth: ہر protected endpoint پر `Authorization: Bearer <jwt>` header required۔

---

## 13. Security Considerations

- **RLS everywhere** — کبھی بھی "trust the client" نہ کریں؛ ہر table پر policy enforce
- **Input validation**: Zod schemas (frontend) + server-side re-validation (Edge Functions) — کبھی صرف client validation پر انحصار نہ کریں
- **PCI-DSS**: card data کبھی اپنے servers/DB سے نہ چھوئے — Stripe hosted elements
- **Secrets management**: service-role keys صرف server-side (Edge Functions/env), کبھی client bundle میں نہیں
- **Rate limiting**: auth endpoints، checkout، personalization-render پر (Cloudflare/Edge Function level)
- **File upload safety**: user-uploaded images (personalization photos) پر type/size validation + malware scan consideration + signed URLs
- **XSS/CSRF**: React auto-escaping + CSRF tokens on state-changing server actions
- **Webhook verification**: Stripe/payment gateway signatures verify کریں ہر webhook پر
- **Audit logging**: تمام admin actions اور order status changes log ہوں
- **Data privacy**: journal entries انتہائی sensitive ہیں (mental health data) — encryption at rest (Supabase default), کبھی analytics/marketing tools کو raw content share نہ کریں، user کو data export/delete (GDPR-style right) کا option دیں

---

## 14. Scalability Strategy

| Concern | Strategy |
|---|---|
| Traffic spikes (sale events) | Vercel edge caching for product pages (ISR), CDN for images |
| DB load | Read replicas (Supabase supports), connection pooling (PgBouncer), indexed queries on `user_id`, `order.status` |
| Personalization renders (CPU heavy) | Offload to background queue/worker (BullMQ) — کبھی request-response cycle میں block نہ کریں |
| Catalog growth | Full-text search via Postgres `pg_trgm`/Elasticsearch اگر catalog بڑا ہو جائے |
| Wellness data growth (daily logs per user) | Time-partitioned tables (`hydration_logs`, `fitness_logs`) اگر users scale کریں؛ archival strategy for old data |
| Monolith → microservices | Modular monolith سے شروع کریں (clear domain boundaries جیسا section 5.1 میں define کیا) — جب کوئی module (مثلاً fulfillment) الگ scale کی ضرورت ہو تب ہی الگ service نکالیں |
| Multi-region | Later phase — Supabase read replicas + Cloudflare edge |

---

## 15. MVP vs Future Features

### 15.1 MVP (Phase 1)
- Product catalog (6 categories) + basic personalization (text + color, canvas 2D)
- Cart, checkout (Stripe + COD)
- Basic order tracking (status only, no live courier API)
- Auth (email/password + Google OAuth)
- Hydration tracker + Journal (simplest 2 wellness modules — highest engagement/lowest complexity)
- User profile (basic)
- Admin: product CRUD, order management (manual status update)

### 15.2 Phase 2
- Fitness tracker module (manual logging)
- Personalized wellness plans (rule-based, not AI yet)
- Local payment gateways (JazzCash/Easypaisa)
- Courier API integration (real tracking)
- Design templates/presets library
- Push notifications (reminders)
- Reviews & ratings

### 15.3 Phase 3 (Advanced/Future)
- 3D live preview (yoga mat) via Three.js
- AI-personalized wellness plan recommendations (based on logs)
- Wearable device integration (Apple Health/Google Fit sync)
- Subscription/recurring orders (essential oils refill, journal subscription)
- Social/community features (gratitude sharing, challenges)
- Native mobile apps (React Native)
- Multi-vendor/marketplace expansion
- Loyalty/rewards program tied to wellness streaks

---

## 16. Suggested Monorepo Structure

```
wellness-app/
├── apps/
│   ├── web/                 # Next.js customer + admin app
│   └── mobile/               # (Phase 2) React Native
├── packages/
│   ├── ui/                   # shared design system components
│   ├── config/                # shared eslint/tsconfig/tailwind config
│   ├── customizer-engine/     # config-driven personalization canvas logic (shared web/mobile)
│   └── types/                 # shared TypeScript types (DB row types, DTOs)
├── supabase/
│   ├── migrations/            # SQL migrations
│   └── functions/              # Edge Functions (checkout, personalization, wellness, admin)
└── docs/
    └── ARCHITECTURE.md         # یہ document
```

---

## 17. Open Decisions (implementation شروع کرنے سے پہلے confirm کرنی ہیں)

1. Target market صرف Pakistan ہے یا international بھی؟ (currency, payment gateway, shipping partner اسی پر منحصر ہیں)
2. Personalized items کہاں produce ہوں گے — in-house printing/embroidery یا 3rd-party print-on-demand partner؟
3. Mobile app MVP میں چاہیے یا PWA کافی ہے شروع میں؟
4. GitHub Pages repo کو صرف marketing/landing page کے طور پر رکھنا ہے، یا اصل app کے لیے الگ hosting/repo چاہیے؟

---

*یہ document architecture-only ہے۔ آپ کی confirmation کے بعد اگلا step: database migrations + project scaffolding + MVP module-by-module implementation۔*
