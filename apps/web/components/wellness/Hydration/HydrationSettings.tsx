"use client";

import { Card } from "@/components/wellness/ui/Card";
import { useWellnessStore } from "@/lib/store";

export function HydrationSettings() {
  const goal = useWellnessStore((s) => s.hydrationGoal);
  const setHydrationGoal = useWellnessStore((s) => s.setHydrationGoal);

  return (
    <Card>
      <h2 className="mb-3 font-heading text-lg text-foreground">Goal & Reminders</h2>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-foreground">
          Daily target (ml)
          <input
            type="number"
            min={500}
            step={250}
            value={goal.dailyTargetMl}
            onChange={(e) => setHydrationGoal({ dailyTargetMl: Number(e.target.value) })}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-foreground">
          Reminders
          <button
            role="switch"
            aria-checked={goal.reminderEnabled}
            onClick={() => setHydrationGoal({ reminderEnabled: !goal.reminderEnabled })}
            className={`h-6 w-11 rounded-pill transition ${goal.reminderEnabled ? "bg-primary" : "bg-border"}`}
          >
            <span
              className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition ${
                goal.reminderEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>

        {goal.reminderEnabled && (
          <label className="flex flex-col gap-1 text-sm text-foreground">
            Remind every (minutes)
            <input
              type="number"
              min={30}
              step={30}
              value={goal.reminderIntervalMin}
              onChange={(e) => setHydrationGoal({ reminderIntervalMin: Number(e.target.value) })}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        )}
      </div>
    </Card>
  );
}
