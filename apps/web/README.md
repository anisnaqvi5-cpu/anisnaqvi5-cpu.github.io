# Wellness Web App

Next.js implementation of the wellness modules described in `../../WELLNESS_FEATURES.md`,
`../../ARCHITECTURE.md`, `../../UI_UX_SPECIFICATION.md` and `../../DATABASE_SCHEMA.md`.

## Run locally

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 — it redirects to `/wellness` (the dashboard).

## What's implemented

All 9 wellness modules from the spec, fully functional in the browser:

- **Fitness Planner** (`/wellness/fitness`) — goal/experience/days/duration/location/preference
  intake → rule-based weekly plan generation (`lib/wellness/planGenerator.ts`) + activity logging.
- **Workout Tracking** — activity log form + history list (part of the Fitness page).
- **Hydration Tracking** (`/wellness/hydration`) — daily target, quick-add + custom logging,
  progress ring, reminders, weekly history chart.
- **Gratitude Journal** (`/wellness/journal`) — daily rotating prompts, private entries,
  calendar/history view, streak.
- **Mindfulness** (`/wellness/mindfulness`) — breathing exercises with an animated guide,
  meditation timer, session categories, daily session log.
- **Daily Goals** — aggregated on the dashboard (`lib/wellness/dailyGoals.ts`).
- **Streaks** — computed client-side from logs (`lib/wellness/streaks.ts`), shown across
  the dashboard, journal calendar, and mindfulness page.
- **Progress Tracking** (`/wellness/progress`) — cross-module trend charts (recharts).
- **Notifications** — in-app notification center (`NotificationBell`) + a client-side
  hydration reminder scheduler (`lib/wellness/useReminders.ts`) that also uses the
  browser Notification API when permitted.

## Data layer — why local-first, and how it maps to production

`lib/store.ts` is a single Zustand store persisted to `localStorage`. Every action in it
(`logWater`, `upsertGratitudeEntry`, `logWorkout`, …) mirrors an endpoint/table from
`DATABASE_SCHEMA.md` 1:1. This was a deliberate scoping choice for this pass: it delivers a
fully working, testable app with **zero cloud dependency or billing setup**, and no component
ever talks to `localStorage` directly — only to store actions.

Swapping to the real backend later means replacing the *inside* of these actions with
Supabase calls (`supabase.from('hydration_logs').insert(...)`, etc.) — component code and
prop shapes stay the same. See `../../WELLNESS_FEATURES.md` §Privacy & Data Security for the
production RLS/encryption plan this local version stands in for.

## Stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand (+ `persist`) · Recharts ·
date-fns · lucide-react.
