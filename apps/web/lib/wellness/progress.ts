import { eachDayOfInterval, format, subDays } from "date-fns";
import type { GratitudeEntry, HydrationLog, MindfulnessLog, WorkoutLog } from "@/lib/types";

export interface DailyProgressPoint {
  date: string; // yyyy-MM-dd
  label: string;
  hydrationMl: number;
  workoutMin: number;
  mindfulnessMin: number;
  journalDone: 0 | 1;
}

export function buildDailySeries(
  rangeDays: number,
  data: {
    hydrationLogs: HydrationLog[];
    workoutLogs: WorkoutLog[];
    mindfulnessLogs: MindfulnessLog[];
    gratitudeEntries: GratitudeEntry[];
  }
): DailyProgressPoint[] {
  const days = eachDayOfInterval({ start: subDays(new Date(), rangeDays - 1), end: new Date() });

  return days.map((day) => {
    const dayKey = format(day, "yyyy-MM-dd");
    const hydrationMl = data.hydrationLogs
      .filter((l) => format(new Date(l.loggedAt), "yyyy-MM-dd") === dayKey)
      .reduce((sum, l) => sum + l.amountMl, 0);
    const workoutMin = data.workoutLogs
      .filter((l) => format(new Date(l.loggedAt), "yyyy-MM-dd") === dayKey)
      .reduce((sum, l) => sum + l.durationMin, 0);
    const mindfulnessMin = Math.round(
      data.mindfulnessLogs
        .filter((l) => format(new Date(l.loggedAt), "yyyy-MM-dd") === dayKey)
        .reduce((sum, l) => sum + l.durationListenedSec, 0) / 60
    );
    const journalDone = data.gratitudeEntries.some((e) => e.entryDate === dayKey) ? 1 : 0;

    return {
      date: dayKey,
      label: format(day, rangeDays > 10 ? "d/M" : "EEE"),
      hydrationMl,
      workoutMin,
      mindfulnessMin,
      journalDone,
    };
  });
}
