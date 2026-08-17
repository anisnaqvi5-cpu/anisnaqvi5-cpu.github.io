import { describe, expect, it } from "vitest";
import { generateFitnessPlan, rankWorkoutsForProfile } from "@/lib/wellness/planGenerator";
import type { FitnessProfile, Workout } from "@/lib/types";

const catalog: Workout[] = [
  { id: "w-run", title: "Easy Run", activityType: "run", difficulty: "beginner", durationMin: 30, location: "outdoor", description: "", caloriesEstimate: 250 },
  { id: "w-yoga", title: "Morning Yoga", activityType: "yoga", difficulty: "beginner", durationMin: 20, location: "home", description: "", caloriesEstimate: 100 },
  { id: "w-gym-adv", title: "Advanced Lifting", activityType: "gym", difficulty: "advanced", durationMin: 60, location: "gym", description: "", caloriesEstimate: 400 },
  { id: "w-cycle", title: "Cycling Loop", activityType: "cycling", difficulty: "intermediate", durationMin: 45, location: "outdoor", description: "", caloriesEstimate: 350 },
];

function profile(overrides: Partial<FitnessProfile> = {}): FitnessProfile {
  return {
    goalType: "weight_loss",
    experienceLevel: "beginner",
    location: "any",
    preference: [],
    workoutDurationMin: 30,
    availableDays: [1, 3, 5],
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("rankWorkoutsForProfile", () => {
  it("excludes workouts more than one difficulty level away", () => {
    const ranked = rankWorkoutsForProfile(profile({ experienceLevel: "beginner" }), catalog);
    expect(ranked.some((w) => w.id === "w-gym-adv")).toBe(false);
  });

  it("prioritizes activities matching the goal's priority list", () => {
    const ranked = rankWorkoutsForProfile(profile({ goalType: "weight_loss" }), catalog);
    // weight_loss priority: run, cycling, walk, gym, swimming — run should outrank yoga.
    const runIdx = ranked.findIndex((w) => w.id === "w-run");
    const yogaIdx = ranked.findIndex((w) => w.id === "w-yoga");
    expect(runIdx).toBeLessThan(yogaIdx);
  });

  it("respects an explicit activity preference filter", () => {
    const ranked = rankWorkoutsForProfile(profile({ preference: ["yoga"] }), catalog);
    expect(ranked.every((w) => w.activityType === "yoga")).toBe(true);
  });

  it("falls back to the full catalog rather than returning nothing", () => {
    const impossible = profile({ location: "home", experienceLevel: "advanced", preference: ["swimming"] });
    const ranked = rankWorkoutsForProfile(impossible, catalog);
    expect(ranked.length).toBeGreaterThan(0);
  });
});

describe("generateFitnessPlan", () => {
  it("schedules exactly one workout per requested available day", () => {
    const plan = generateFitnessPlan(profile({ availableDays: [1, 3, 5] }), catalog);
    expect(plan.weeklySchedule).toHaveLength(3);
    expect(plan.weeklySchedule.map((s) => s.dayOfWeek).sort()).toEqual([1, 3, 5]);
  });

  it("defaults to Mon/Wed/Fri when no days are selected", () => {
    const plan = generateFitnessPlan(profile({ availableDays: [] }), catalog);
    expect(plan.weeklySchedule.map((s) => s.dayOfWeek).sort()).toEqual([1, 3, 5]);
  });

  it("only assigns workout ids that exist in the provided catalog", () => {
    const plan = generateFitnessPlan(profile(), catalog);
    const catalogIds = new Set(catalog.map((w) => w.id));
    for (const entry of plan.weeklySchedule) {
      expect(catalogIds.has(entry.workoutId)).toBe(true);
    }
  });
});
