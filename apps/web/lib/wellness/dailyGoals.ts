import { format, isSameDay, parseISO } from "date-fns";
import type {
  FitnessPlan,
  GratitudeEntry,
  HydrationGoal,
  HydrationLog,
  MindfulnessLog,
  WorkoutLog,
} from "@/lib/types";

export interface DailyGoal {
  id: "hydration" | "fitness" | "journal" | "mindfulness";
  label: string;
  done: boolean;
  detail: string;
}

function isToday(iso: string): boolean {
  return isSameDay(iso.length <= 10 ? parseISO(iso) : new Date(iso), new Date());
}

export function computeDailyGoals(input: {
  hydrationGoal: HydrationGoal;
  hydrationLogs: HydrationLog[];
  activePlan: FitnessPlan | null;
  workoutLogs: WorkoutLog[];
  gratitudeEntries: GratitudeEntry[];
  mindfulnessLogs: MindfulnessLog[];
}): DailyGoal[] {
  const todayHydrationMl = input.hydrationLogs
    .filter((l) => isToday(l.loggedAt))
    .reduce((sum, l) => sum + l.amountMl, 0);
  const hydrationDone = todayHydrationMl >= input.hydrationGoal.dailyTargetMl;

  const todayDow = new Date().getDay();
  const scheduledToday = input.activePlan?.weeklySchedule.some((e) => e.dayOfWeek === todayDow) ?? false;
  const fitnessLoggedToday = input.workoutLogs.some((l) => isToday(l.loggedAt));
  const fitnessDone = fitnessLoggedToday || !scheduledToday;

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const journalDone = input.gratitudeEntries.some((e) => e.entryDate === todayKey);

  const mindfulnessDone = input.mindfulnessLogs.some((l) => isToday(l.loggedAt) && l.completed);

  return [
    {
      id: "hydration",
      label: "Hit your hydration goal",
      done: hydrationDone,
      detail: `${todayHydrationMl} / ${input.hydrationGoal.dailyTargetMl} ml`,
    },
    {
      id: "fitness",
      label: scheduledToday ? "Complete today's workout" : "No workout scheduled today",
      done: fitnessDone,
      detail: fitnessLoggedToday ? "Logged" : scheduledToday ? "Not logged yet" : "Rest day",
    },
    {
      id: "journal",
      label: "Write a gratitude entry",
      done: journalDone,
      detail: journalDone ? "Written today" : "Not written yet",
    },
    {
      id: "mindfulness",
      label: "Complete a mindfulness session",
      done: mindfulnessDone,
      detail: mindfulnessDone ? "Completed" : "Not started",
    },
  ];
}
