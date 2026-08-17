import type { GratitudeEntry, MindfulnessSession, Workout } from "@/lib/types";

// Admin-curated content catalog (production: `workouts` table, seeded/managed
// via the Admin "Content Management" screen from UI_UX_SPECIFICATION.md).
export const WORKOUT_CATALOG: Workout[] = [
  {
    id: "w-yoga-flow-20",
    title: "Morning Flow Yoga",
    activityType: "yoga",
    description: "A gentle 20-minute flow to wake up the body and mind.",
    durationMin: 20,
    difficulty: "beginner",
    location: "any",
    caloriesEstimate: 90,
  },
  {
    id: "w-yoga-power-40",
    title: "Power Yoga",
    activityType: "yoga",
    description: "A stronger flow building flexibility and core strength.",
    durationMin: 40,
    difficulty: "intermediate",
    location: "any",
    caloriesEstimate: 220,
  },
  {
    id: "w-walk-30",
    title: "Brisk Walk",
    activityType: "walk",
    description: "A steady-pace walk outdoors or on a treadmill.",
    durationMin: 30,
    difficulty: "beginner",
    location: "outdoor",
    caloriesEstimate: 150,
  },
  {
    id: "w-run-30",
    title: "Interval Run",
    activityType: "run",
    description: "Alternating jog/sprint intervals for cardio conditioning.",
    durationMin: 30,
    difficulty: "intermediate",
    location: "outdoor",
    caloriesEstimate: 320,
  },
  {
    id: "w-gym-strength-45",
    title: "Full-Body Strength",
    activityType: "gym",
    description: "Compound lifts targeting all major muscle groups.",
    durationMin: 45,
    difficulty: "intermediate",
    location: "gym",
    caloriesEstimate: 300,
  },
  {
    id: "w-gym-beginner-30",
    title: "Beginner Strength Circuit",
    activityType: "gym",
    description: "Machine-based circuit, ideal for first-time gym-goers.",
    durationMin: 30,
    difficulty: "beginner",
    location: "gym",
    caloriesEstimate: 180,
  },
  {
    id: "w-cycle-40",
    title: "Steady-State Cycling",
    activityType: "cycling",
    description: "Moderate-intensity ride to build endurance.",
    durationMin: 40,
    difficulty: "intermediate",
    location: "outdoor",
    caloriesEstimate: 280,
  },
  {
    id: "w-home-hiit-20",
    title: "At-Home HIIT",
    activityType: "gym",
    description: "No-equipment bodyweight HIIT circuit.",
    durationMin: 20,
    difficulty: "advanced",
    location: "home",
    caloriesEstimate: 240,
  },
  {
    id: "w-swim-30",
    title: "Pool Laps",
    activityType: "swimming",
    description: "Low-impact full-body cardio in the pool.",
    durationMin: 30,
    difficulty: "intermediate",
    location: "outdoor",
    caloriesEstimate: 260,
  },
  {
    id: "w-yoga-restorative-15",
    title: "Restorative Stretch",
    activityType: "yoga",
    description: "Slow stretches for recovery and stress relief.",
    durationMin: 15,
    difficulty: "beginner",
    location: "home",
    caloriesEstimate: 60,
  },
];

export const MINDFULNESS_CATALOG: MindfulnessSession[] = [
  {
    id: "m-box-breathing",
    title: "Box Breathing",
    category: "breathing",
    description: "4-4-4-4 breathing to calm the nervous system.",
    durationSec: 240,
    breathingPattern: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
  },
  {
    id: "m-calm-breath",
    title: "Calming Breath",
    category: "breathing",
    description: "Slow 4-7-8 breathing for quick stress relief.",
    durationSec: 180,
    breathingPattern: { inhale: 4, hold: 7, exhale: 8 },
  },
  {
    id: "m-body-scan-10",
    title: "10-Minute Body Scan",
    category: "body_scan",
    description: "A guided scan to release tension from head to toe.",
    durationSec: 600,
  },
  {
    id: "m-sleep-wind-down",
    title: "Sleep Wind-Down",
    category: "sleep",
    description: "Gentle breathing to prepare the body for rest.",
    durationSec: 300,
    breathingPattern: { inhale: 4, hold: 0, exhale: 6 },
  },
  {
    id: "m-focus-reset",
    title: "Focus Reset",
    category: "focus",
    description: "A short breathing break to reset attention.",
    durationSec: 120,
    breathingPattern: { inhale: 4, hold: 2, exhale: 4 },
  },
];

// Admin-curated prompt library (production: content_management screen).
export const GRATITUDE_PROMPTS: string[] = [
  "آج آپ کس چیز کے لیے شکر گزار ہیں؟",
  "کسی نے آج آپ کی مدد کی — کون تھا؟",
  "آج کا وہ لمحہ جو آپ کو مسکرا گیا۔",
  "آپ کے جسم کی کونسی صلاحیت پر آپ شکر گزار ہیں؟",
  "کوئی چھوٹی سی خوشی جو آج ملی۔",
  "آپ کی زندگی میں کونسا رشتہ آپ کے لیے قیمتی ہے؟",
  "آج آپ نے خود کے لیے کیا اچھا کیا؟",
];

export function todaysPrompt(): string {
  const dayIndex = new Date().getDate() % GRATITUDE_PROMPTS.length;
  return GRATITUDE_PROMPTS[dayIndex];
}

export const DEFAULT_GRATITUDE_ITEMS: GratitudeEntry["gratitudeItems"] = [];
