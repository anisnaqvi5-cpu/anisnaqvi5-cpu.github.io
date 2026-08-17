import { describe, expect, it } from "vitest";
import { format } from "date-fns";
import { computeDailyGoals } from "@/lib/wellness/dailyGoals";
import type { FitnessPlan, HydrationGoal } from "@/lib/types";

const hydrationGoal: HydrationGoal = { dailyTargetMl: 2000, reminderEnabled: false, reminderIntervalMin: 60 };

const basePlan: FitnessPlan = {
  id: "plan-1",
  title: "Test Plan",
  goalType: "general_activity",
  weeklySchedule: [{ dayOfWeek: new Date().getDay(), workoutId: "w1" }],
  createdAt: new Date().toISOString(),
  isActive: true,
};

describe("computeDailyGoals", () => {
  it("marks hydration done once today's logs meet the target", () => {
    const goals = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [{ id: "1", amountMl: 2200, loggedAt: new Date().toISOString() }],
      activePlan: null,
      workoutLogs: [],
      gratitudeEntries: [],
      mindfulnessLogs: [],
    });
    expect(goals.find((g) => g.id === "hydration")?.done).toBe(true);
  });

  it("leaves hydration undone when under target", () => {
    const goals = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [{ id: "1", amountMl: 500, loggedAt: new Date().toISOString() }],
      activePlan: null,
      workoutLogs: [],
      gratitudeEntries: [],
      mindfulnessLogs: [],
    });
    expect(goals.find((g) => g.id === "hydration")?.done).toBe(false);
  });

  it("treats a scheduled workout as done only once logged today", () => {
    const notLogged = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [],
      activePlan: basePlan,
      workoutLogs: [],
      gratitudeEntries: [],
      mindfulnessLogs: [],
    });
    expect(notLogged.find((g) => g.id === "fitness")?.done).toBe(false);

    const logged = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [],
      activePlan: basePlan,
      workoutLogs: [{ id: "l1", workoutId: "w1", activityType: "gym", loggedAt: new Date().toISOString(), durationMin: 30 }],
      gratitudeEntries: [],
      mindfulnessLogs: [],
    });
    expect(logged.find((g) => g.id === "fitness")?.done).toBe(true);
  });

  it("marks fitness done (rest day) when nothing is scheduled today", () => {
    const restDayPlan: FitnessPlan = { ...basePlan, weeklySchedule: [{ dayOfWeek: (new Date().getDay() + 3) % 7, workoutId: "w1" }] };
    const goals = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [],
      activePlan: restDayPlan,
      workoutLogs: [],
      gratitudeEntries: [],
      mindfulnessLogs: [],
    });
    expect(goals.find((g) => g.id === "fitness")?.done).toBe(true);
  });

  it("marks journal done only for an entry dated today", () => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const goals = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [],
      activePlan: null,
      workoutLogs: [],
      gratitudeEntries: [
        {
          id: "g1",
          entryDate: todayKey,
          prompt: "What are you grateful for?",
          gratitudeItems: ["Coffee"],
          content: "Grateful for coffee",
          mood: "good",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      mindfulnessLogs: [],
    });
    expect(goals.find((g) => g.id === "journal")?.done).toBe(true);
  });

  it("marks mindfulness done only for a completed session logged today", () => {
    const incomplete = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [],
      activePlan: null,
      workoutLogs: [],
      gratitudeEntries: [],
      mindfulnessLogs: [{ id: "m1", sessionId: "s1", loggedAt: new Date().toISOString(), completed: false, durationListenedSec: 60 }],
    });
    expect(incomplete.find((g) => g.id === "mindfulness")?.done).toBe(false);

    const complete = computeDailyGoals({
      hydrationGoal,
      hydrationLogs: [],
      activePlan: null,
      workoutLogs: [],
      gratitudeEntries: [],
      mindfulnessLogs: [{ id: "m1", sessionId: "s1", loggedAt: new Date().toISOString(), completed: true, durationListenedSec: 300 }],
    });
    expect(complete.find((g) => g.id === "mindfulness")?.done).toBe(true);
  });
});
