import { describe, expect, it } from "vitest";
import { format, subDays } from "date-fns";
import { calculateStreak } from "@/lib/wellness/streaks";

function daysAgoIso(n: number): string {
  return format(subDays(new Date(), n), "yyyy-MM-dd");
}

describe("calculateStreak", () => {
  it("returns zeroed info for no timestamps", () => {
    expect(calculateStreak([])).toEqual({ current: 0, longest: 0, activeToday: false });
  });

  it("counts a single consecutive run including today", () => {
    const timestamps = [daysAgoIso(0), daysAgoIso(1), daysAgoIso(2)];
    const result = calculateStreak(timestamps);
    expect(result.current).toBe(3);
    expect(result.longest).toBe(3);
    expect(result.activeToday).toBe(true);
  });

  it("does not zero the current streak if today is missing but yesterday is logged", () => {
    const timestamps = [daysAgoIso(1), daysAgoIso(2), daysAgoIso(3)];
    const result = calculateStreak(timestamps);
    expect(result.activeToday).toBe(false);
    expect(result.current).toBe(3);
  });

  it("breaks the current streak once a full day is skipped", () => {
    const timestamps = [daysAgoIso(0), daysAgoIso(2), daysAgoIso(3)];
    const result = calculateStreak(timestamps);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(2);
  });

  it("collapses duplicate same-day timestamps into a single logged day", () => {
    const today = new Date().toISOString();
    const result = calculateStreak([today, today, today]);
    expect(result.current).toBe(1);
    expect(result.longest).toBe(1);
  });

  it("finds the longest historical run even if it isn't the current one", () => {
    const timestamps = [daysAgoIso(0), daysAgoIso(10), daysAgoIso(11), daysAgoIso(12), daysAgoIso(13)];
    const result = calculateStreak(timestamps);
    expect(result.longest).toBe(4);
    expect(result.current).toBe(1);
  });
});
