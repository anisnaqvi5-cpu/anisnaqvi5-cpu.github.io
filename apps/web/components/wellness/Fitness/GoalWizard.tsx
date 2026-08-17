"use client";

import { useState } from "react";
import { Card } from "@/components/wellness/ui/Card";
import { useWellnessStore } from "@/lib/store";
import { useEnsureLiveContent, useLiveContentStore } from "@/lib/wellness/useLiveContent";
import type { ActivityType, ExperienceLevel, FitnessProfile, GoalType, WorkoutLocation } from "@/lib/types";

const GOAL_OPTIONS: { value: GoalType; label: string }[] = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "flexibility", label: "Flexibility" },
  { value: "strength", label: "Strength Building" },
  { value: "general_activity", label: "General Activity" },
  { value: "stress_relief", label: "Stress Relief" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const LOCATION_OPTIONS: { value: WorkoutLocation; label: string }[] = [
  { value: "home", label: "Home" },
  { value: "gym", label: "Gym" },
  { value: "outdoor", label: "Outdoor" },
  { value: "any", label: "No preference" },
];

const PREFERENCE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "yoga", label: "Yoga" },
  { value: "walk", label: "Walking" },
  { value: "run", label: "Running" },
  { value: "gym", label: "Strength/Gym" },
  { value: "cycling", label: "Cycling" },
  { value: "swimming", label: "Swimming" },
];

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function GoalWizard({ existing, onSaved }: { existing: FitnessProfile | null; onSaved?: () => void }) {
  const setFitnessProfileAndGeneratePlan = useWellnessStore((s) => s.setFitnessProfileAndGeneratePlan);
  useEnsureLiveContent();
  const liveWorkouts = useLiveContentStore((s) => s.workouts);

  const [goalType, setGoalType] = useState<GoalType>(existing?.goalType ?? "general_activity");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(existing?.experienceLevel ?? "beginner");
  const [availableDays, setAvailableDays] = useState<number[]>(existing?.availableDays ?? [1, 3, 5]);
  const [workoutDurationMin, setWorkoutDurationMin] = useState(existing?.workoutDurationMin ?? 30);
  const [location, setLocation] = useState<WorkoutLocation>(existing?.location ?? "any");
  const [preference, setPreference] = useState<ActivityType[]>(existing?.preference ?? []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFitnessProfileAndGeneratePlan({
      goalType,
      experienceLevel,
      availableDays: availableDays.length ? availableDays : [1, 3, 5],
      workoutDurationMin,
      location,
      preference,
      updatedAt: new Date().toISOString(),
    }, liveWorkouts);
    onSaved?.();
  }

  return (
    <Card>
      <h2 className="mb-1 font-heading text-lg text-foreground">
        {existing ? "Update Your Fitness Profile" : "Let's build your plan"}
      </h2>
      <p className="mb-4 text-sm text-muted">Tell us your goals and we&apos;ll build a personalized weekly plan.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Goal</legend>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setGoalType(opt.value)}
                className={`rounded-pill border px-3 py-1.5 text-sm transition ${
                  goalType === opt.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Experience Level</legend>
          <div className="flex gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setExperienceLevel(opt.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                  experienceLevel === opt.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Available Days</legend>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map((label, dayIndex) => (
              <button
                type="button"
                key={label}
                onClick={() => setAvailableDays((d) => toggleInArray(d, dayIndex))}
                className={`h-10 w-12 rounded-lg border text-sm transition ${
                  availableDays.includes(dayIndex)
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">
            Workout Duration — {workoutDurationMin} min
          </legend>
          <input
            type="range"
            min={10}
            max={60}
            step={5}
            value={workoutDurationMin}
            onChange={(e) => setWorkoutDurationMin(Number(e.target.value))}
            className="w-full accent-[color:var(--color-primary)]"
          />
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Workout Location</legend>
          <div className="flex flex-wrap gap-2">
            {LOCATION_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setLocation(opt.value)}
                className={`rounded-pill border px-3 py-1.5 text-sm transition ${
                  location === opt.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-foreground">Fitness Preference (optional)</legend>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={() => setPreference((p) => toggleInArray(p, opt.value))}
                className={`rounded-pill border px-3 py-1.5 text-sm transition ${
                  preference.includes(opt.value)
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-border text-muted hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="mt-2 rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {existing ? "Regenerate My Plan" : "Generate My Plan"}
        </button>
      </form>
    </Card>
  );
}
