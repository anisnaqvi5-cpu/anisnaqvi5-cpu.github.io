"use client";

import { useState } from "react";
import { Card } from "@/components/wellness/ui/Card";
import { useWellnessStore } from "@/lib/store";
import type { ActivityType } from "@/lib/types";

const ACTIVITY_OPTIONS: ActivityType[] = ["yoga", "walk", "run", "gym", "cycling", "swimming", "other"];

export function LogWorkoutForm() {
  const logWorkout = useWellnessStore((s) => s.logWorkout);
  const [activityType, setActivityType] = useState<ActivityType>("walk");
  const [durationMin, setDurationMin] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [justLogged, setJustLogged] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    logWorkout({
      activityType,
      durationMin,
      caloriesBurned: caloriesBurned === "" ? undefined : Number(caloriesBurned),
      notes: notes || undefined,
    });
    setNotes("");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2000);
  }

  return (
    <Card>
      <h2 className="mb-3 font-heading text-lg text-foreground">Log Activity</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select
          value={activityType}
          onChange={(e) => setActivityType(e.target.value as ActivityType)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {ACTIVITY_OPTIONS.map((a) => (
            <option key={a} value={a}>
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Duration (min)
            <input
              type="number"
              min={1}
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            Calories (optional)
            <input
              type="number"
              min={0}
              value={caloriesBurned}
              onChange={(e) => setCaloriesBurned(e.target.value === "" ? "" : Number(e.target.value))}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={2}
          className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <button
          type="submit"
          className="rounded-pill bg-primary py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          {justLogged ? "Logged ✓" : "Log Activity"}
        </button>
      </form>
    </Card>
  );
}
