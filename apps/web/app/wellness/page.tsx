"use client";

import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { DailyGoalsChecklist } from "@/components/wellness/Dashboard/DailyGoalsChecklist";
import { MiniHydrationWidget } from "@/components/wellness/Dashboard/MiniHydrationWidget";
import { MiniStreaksWidget } from "@/components/wellness/Dashboard/MiniStreaksWidget";
import { QuickLogRow } from "@/components/wellness/Dashboard/QuickLogRow";
import { TodayPlanCard } from "@/components/wellness/Dashboard/TodayPlanCard";
import { getActivePlan, useWellnessStore } from "@/lib/store";
import { computeDailyGoals } from "@/lib/wellness/dailyGoals";
import { type AppLocale } from "@/lib/wellness/seedData";
import { useEnsureLiveContent, useLiveContentStore } from "@/lib/wellness/useLiveContent";

const GREETINGS: Record<AppLocale, [string, string, string]> = {
  en: ["Good morning", "Good afternoon", "Good evening"],
  ar: ["صباح الخير", "طاب يومك", "مساء الخير"],
};

function greeting(locale: AppLocale): string {
  const hour = new Date().getHours();
  const [morning, afternoon, evening] = GREETINGS[locale];
  if (hour < 12) return morning;
  if (hour < 17) return afternoon;
  return evening;
}

function DashboardContent() {
  useEnsureLiveContent();
  const liveWorkouts = useLiveContentStore((s) => s.workouts);
  const locale = useWellnessStore((s) => s.locale);
  const hydrationGoal = useWellnessStore((s) => s.hydrationGoal);
  const hydrationLogs = useWellnessStore((s) => s.hydrationLogs);
  const workoutLogs = useWellnessStore((s) => s.workoutLogs);
  const gratitudeEntries = useWellnessStore((s) => s.gratitudeEntries);
  const mindfulnessLogs = useWellnessStore((s) => s.mindfulnessLogs);
  const fitnessPlans = useWellnessStore((s) => s.fitnessPlans);
  const activePlan = getActivePlan({ fitnessPlans });

  const goals = computeDailyGoals({
    hydrationGoal,
    hydrationLogs,
    activePlan,
    workoutLogs,
    gratitudeEntries,
    mindfulnessLogs,
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 dir="auto" className="font-heading text-2xl text-foreground">{greeting(locale)} 🌿</h1>
        <p className="text-sm text-muted">Here&apos;s your wellness snapshot for today.</p>
      </div>

      <QuickLogRow />

      <div className="grid gap-4 sm:grid-cols-2">
        <MiniHydrationWidget />
        <TodayPlanCard plan={activePlan} catalog={liveWorkouts} />
      </div>

      <DailyGoalsChecklist goals={goals} />
      <MiniStreaksWidget />
    </div>
  );
}

export default function WellnessDashboardPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </ClientOnly>
  );
}
