# Wellness Modules — Design & Implementation

> Reference: `ARCHITECTURE.md`, `UI_UX_SPECIFICATION.md` (Screens 14–18: Wellness Dashboard, Fitness Planner, Hydration Tracker, Gratitude Journal, Mindfulness), `DATABASE_SCHEMA.md` (wellness domain tables)۔ Code: `apps/web/` (Next.js — run instructions in `apps/web/README.md`)۔
>
> یہ 9 modules **implement** کیے گئے ہیں — working browser app کے طور پر، local-first data layer کے ساتھ (rationale نیچے section 2 میں)۔

---

## 1. Modules Implemented

| # | Module | Route | Key capability |
|---|---|---|---|
| 1 | Fitness Planner | `/wellness/fitness` | Goal/experience/days/duration/location/preference intake → rule-based weekly plan |
| 2 | Workout Tracking | `/wellness/fitness` | Log activity (type, duration, calories, notes), history list |
| 3 | Hydration Tracking | `/wellness/hydration` | Daily target, quick-add + custom logging, reminders, daily/weekly history |
| 4 | Gratitude Journal | `/wellness/journal` | Daily rotating prompts, private entries, calendar/history, streak |
| 5 | Mindfulness | `/wellness/mindfulness` | Breathing exercises (animated guide), meditation timer, session categories |
| 6 | Daily Goals | Dashboard | Aggregated checklist across all 4 modules |
| 7 | Streaks | Dashboard + per-module | Computed from logs — current + longest run |
| 8 | Progress Tracking | `/wellness/progress` | 7d/30d trend charts across all modules |
| 9 | Notifications | Global (bell icon) | In-app center + client-side hydration reminder scheduler |

### 1.1 Fitness Planner — Plan Generation Algorithm
`apps/web/lib/wellness/planGenerator.ts` — rule-based (per `ARCHITECTURE.md`'s MVP scope: "rule-based, not AI yet"):
1. Filter the workout catalog by **location compatibility** and **experience-level compatibility** (±1 level so beginners/advanced users aren't over-restricted).
2. Filter by **stated activity preference** (if any given).
3. Rank remaining workouts by a **goal→activity priority map** (e.g. `weight_loss` prioritizes run/cycling/walk; `flexibility` prioritizes yoga) and by closeness to the requested duration.
4. Distribute the top-ranked workouts across the user's **available days**, rotating for variety.

This is deterministic and explainable (a user can see *why* a workout was picked), and the priority map is the natural seam where a future ML-based recommender (Phase 3 in `ARCHITECTURE.md`) would plug in.

### 1.2 Daily Goals & Streaks
Both are **computed, not stored** — derived on the client from the raw logs (`lib/wellness/dailyGoals.ts`, `lib/wellness/streaks.ts`). This matches the production recommendation in `DATABASE_SCHEMA.md` §3.4 ("streaks — materialized view or scheduled job, not a stored mutable counter") — avoids drift between stored counters and actual log history.

### 1.3 Notifications / Reminders
`lib/wellness/useReminders.ts` runs a client-side scheduler (checked every minute) that nudges the user when their hydration goal isn't met and the configured reminder interval has elapsed, using the in-app notification center and (with permission) the browser Notification API. In production this same trigger rule ("goal not met + interval elapsed") moves server-side as a scheduled job pushing via FCM (`ARCHITECTURE.md` §2.6) — the rule doesn't change, only where it runs.

---

## 2. Why Local-First (current implementation) and How It Maps to Production

**Current state:** all wellness data lives in one `localStorage`-persisted Zustand store (`apps/web/lib/store.ts`). This was a deliberate scope decision for this implementation pass — it ships a fully working, in-browser-testable app for all 9 modules **without provisioning cloud infrastructure or making a billing decision on the project owner's behalf** (Supabase project creation, org selection, etc. — see `ARCHITECTURE.md` §2.2 for the intended real backend).

**Why this is safe to build on:** every store action (`logWater`, `upsertGratitudeEntry`, `logWorkout`, `logMindfulnessSession`, …) mirrors one table/endpoint from `DATABASE_SCHEMA.md` 1:1, and no component talks to `localStorage` directly — only to store actions. Swapping the *inside* of these actions for real Supabase calls is a drop-in change; component code, prop shapes, and the whole UI stay the same.

| Local (now) | Production (per prior docs) |
|---|---|
| `localStorage` via Zustand `persist` | Postgres via Supabase, RLS-protected |
| Client-side reminder `setInterval` | Server-side scheduled job → FCM push |
| No auth (device-scoped data) | Supabase Auth (JWT) — `ARCHITECTURE.md` §7 |
| `exportAllData()` → JSON download | `GET /functions/v1/users/me/export` (same shape) |
| `clearAllWellnessData()` | Account-deletion Edge Function + cascading DB deletes |

---

## 3. Integration With the User Dashboard

`app/wellness/page.tsx` is the single integration point — it does **not** duplicate module logic, it composes read-only widgets that pull from the same store slices the module pages write to:

```
Dashboard
 ├─ QuickLogRow          → write actions (logWater, links to journal/fitness/mindfulness)
 ├─ MiniHydrationWidget  → reads hydrationLogs + hydrationGoal
 ├─ TodayPlanCard        → reads active fitnessPlan + today's scheduled workout
 ├─ DailyGoalsChecklist  → computeDailyGoals() over all 4 modules' state
 └─ MiniStreaksWidget    → calculateStreak() per module's logs
```

Every widget links through to its full module page (`/wellness/hydration`, `/wellness/fitness`, etc.), so the dashboard is a **snapshot + entry point**, not a separate data model — consistent with `UI_UX_SPECIFICATION.md` Screen 14's spec.

---

## 4. Privacy & Wellness-Data Security

Wellness data (journal entries, mood, mindfulness logs, fitness/health details) is **more sensitive than typical e-commerce data** — it deserves a stricter posture than "just another table."

### 4.1 Data Classification
| Sensitivity | Data | Handling |
|---|---|---|
| **High** | `gratitude_entries.content`, `mood` | Never sent to analytics/marketing tools in raw form; never shown to admin/support without explicit user consent (support tooling should show metadata — "entry exists on 2026-08-14" — not content) |
| **Medium** | `hydration_logs`, `workout_logs`, `mindfulness_session_logs` | Aggregatable for the user's own trends; not shared cross-user or with third parties |
| **Low** | `fitness_goals`, `hydration_goals` (targets/preferences) | Used to personalize the experience, not independently sensitive |

### 4.2 Current (local) implementation
- Data never leaves the device — no network calls, no third-party SDKs reading store state.
- **User-controlled export & delete** are built in and reachable from the Progress page (`PrivacyControls`): `exportAllData()` produces a full JSON download; `clearAllWellnessData()` is a two-step confirm-then-delete, wiping every wellness table client-side. This mirrors the GDPR-style "right to access / right to erasure" the production system must also honor.
- No profanity/content moderation is needed locally since content isn't shared with anyone — this becomes relevant once journal/community features are added (out of current scope).

### 4.3 Production security model (target — per `ARCHITECTURE.md` §13 and `DATABASE_SCHEMA.md` §3.1)
- **Row Level Security on every wellness table** — `user_id = auth.uid()`, no exceptions, admin included (admin support tooling goes through a service-role Edge Function with its own audit log, never a direct table bypass).
- **Encryption at rest** (Supabase/Postgres default) + **TLS in transit** for all API calls.
- **No raw journal content in logs/analytics pipelines.** Product analytics on journaling should track *behavioral* events only (`entry_created`, `streak_incremented`) — never event payloads containing `content`/`gratitude_items`.
- **Consent for notifications**: reminder permission requested explicitly (mirrors the local implementation's `Notification.requestPermission()` prompt), and is a per-category toggle in Settings (`UI_UX_SPECIFICATION.md` Screen 22) — hydration reminders can be on while promotional pushes are off.
- **Data portability & erasure**: `GET /functions/v1/users/me/export` and account-deletion flow are first-class API surface, not an afterthought — this is what the local `exportAllData`/`clearAllWellnessData` actions stand in for today.
- **Audit logging**: any admin/staff access to a user's wellness data (support investigating a complaint, etc.) is logged (`audit_logs` per `DATABASE_SCHEMA.md`) — access to journal content specifically should require a documented support reason, not ambient admin visibility.
- **Rate limiting** on write-heavy wellness endpoints (hydration/workout logging) to prevent abuse, consistent with `ARCHITECTURE.md` §13.
- **Minimal data collection**: mood/gratitude fields are optional wherever the UI allows skipping them — the app shouldn't force disclosure of sensitive personal reflection to function.

---

## 5. What's Next

- Wire `lib/store.ts` actions to Supabase (replace `persist` storage + action bodies; component code unchanged).
- Move the hydration reminder scheduler server-side (Supabase Cron + FCM) once push infra exists.
- Admin Content Management screen (`UI_UX_SPECIFICATION.md` A9) to author the workout/mindfulness catalogs and gratitude prompts that are currently hardcoded in `lib/wellness/seedData.ts`.

---

*یہ implementation `ARCHITECTURE.md`, `UI_UX_SPECIFICATION.md`, اور `DATABASE_SCHEMA.md` کے ساتھ مکمل طور پر مطابقت رکھتی ہے — local-first ہونا صرف اس pass کا scoping فیصلہ ہے، architecture کا نہیں۔*
