import { format, parseISO, subDays } from "date-fns";
import type { StreakInfo } from "@/lib/types";

function toDayKey(isoOrDate: string): string {
  return format(isoOrDate.length <= 10 ? parseISO(isoOrDate) : new Date(isoOrDate), "yyyy-MM-dd");
}

/**
 * Computes current + longest daily streaks from a list of timestamps
 * (one per logged activity — duplicates on the same day collapse to one).
 * "current" counts backwards from today; a missed *yesterday* (with nothing
 * logged today yet) doesn't zero the streak until a full day is skipped.
 */
export function calculateStreak(timestamps: string[]): StreakInfo {
  const days = Array.from(new Set(timestamps.map(toDayKey))).sort();
  if (days.length === 0) return { current: 0, longest: 0, activeToday: false };

  const daySet = new Set(days);
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const activeToday = daySet.has(todayKey);

  // Longest streak: scan sorted unique days for consecutive runs.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = parseISO(days[i - 1]);
    const expectedNext = format(subDays(parseISO(days[i]), 1), "yyyy-MM-dd");
    if (format(prev, "yyyy-MM-dd") === expectedNext) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
  }

  // Current streak: walk backwards from today (or yesterday if today has no
  // entry yet, so a user checking mid-day doesn't see their streak drop to 0).
  let cursor = activeToday ? new Date() : subDays(new Date(), 1);
  let current = 0;
  while (daySet.has(format(cursor, "yyyy-MM-dd"))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }

  return { current, longest, activeToday };
}
