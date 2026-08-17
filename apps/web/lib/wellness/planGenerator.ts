import type {
  ActivityType,
  ExperienceLevel,
  FitnessPlan,
  FitnessProfile,
  Workout,
} from "@/lib/types";

// Rule-based fitness plan generator (CUSTOMIZATION_STUDIO.md / ARCHITECTURE.md
// scope this as "rule-based, not AI yet" for the current phase). Deterministic
// and explainable: filters the workout catalog by the user's constraints,
// ranks by goal-relevance + duration fit, then distributes across the
// user's available days.

const GOAL_ACTIVITY_PRIORITY: Record<FitnessProfile["goalType"], ActivityType[]> = {
  weight_loss: ["run", "cycling", "walk", "gym", "swimming"],
  flexibility: ["yoga"],
  strength: ["gym"],
  general_activity: ["walk", "yoga", "gym", "cycling"],
  stress_relief: ["yoga", "walk"],
};

const GOAL_LABEL: Record<FitnessProfile["goalType"], string> = {
  weight_loss: "Weight Loss",
  flexibility: "Flexibility",
  strength: "Strength Building",
  general_activity: "General Activity",
  stress_relief: "Stress Relief",
};

const EXPERIENCE_RANK: Record<ExperienceLevel, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

function isLocationCompatible(profile: FitnessProfile, workout: Workout): boolean {
  return (
    profile.location === "any" ||
    workout.location === "any" ||
    workout.location === profile.location
  );
}

function isDifficultyCompatible(profile: FitnessProfile, workout: Workout): boolean {
  // Allow the user's own level and one level below/above so beginners still
  // see options and advanced users aren't limited to only "advanced" tags.
  return Math.abs(EXPERIENCE_RANK[workout.difficulty] - EXPERIENCE_RANK[profile.experienceLevel]) <= 1;
}

export function rankWorkoutsForProfile(profile: FitnessProfile, catalog: Workout[]): Workout[] {
  const priority = GOAL_ACTIVITY_PRIORITY[profile.goalType] ?? [];

  const eligible = catalog.filter(
    (w) =>
      isLocationCompatible(profile, w) &&
      isDifficultyCompatible(profile, w) &&
      (profile.preference.length === 0 || profile.preference.includes(w.activityType))
  );

  const pool = eligible.length > 0 ? eligible : catalog.filter((w) => isLocationCompatible(profile, w));
  const finalPool = pool.length > 0 ? pool : catalog;

  return [...finalPool].sort((a, b) => {
    const pa = priority.indexOf(a.activityType);
    const pb = priority.indexOf(b.activityType);
    const priorityDiff = (pa === -1 ? priority.length : pa) - (pb === -1 ? priority.length : pb);
    if (priorityDiff !== 0) return priorityDiff;
    return (
      Math.abs(a.durationMin - profile.workoutDurationMin) -
      Math.abs(b.durationMin - profile.workoutDurationMin)
    );
  });
}

export function generateFitnessPlan(profile: FitnessProfile, catalog: Workout[]): FitnessPlan {
  const ranked = rankWorkoutsForProfile(profile, catalog);
  const days = profile.availableDays.length > 0 ? profile.availableDays : [1, 3, 5];

  // Rotate through the top-ranked workouts across the chosen days, avoiding
  // repeating the exact same workout on consecutive scheduled days when
  // there's enough variety in the pool to do so.
  const variety = ranked.slice(0, Math.max(3, Math.min(ranked.length, days.length + 2)));
  const schedule = days
    .slice()
    .sort((a, b) => a - b)
    .map((dayOfWeek, i) => ({
      dayOfWeek,
      workoutId: variety[i % variety.length].id,
    }));

  return {
    id: crypto.randomUUID(),
    title: `${GOAL_LABEL[profile.goalType]} Plan`,
    goalType: profile.goalType,
    weeklySchedule: schedule,
    createdAt: new Date().toISOString(),
    isActive: true,
  };
}
