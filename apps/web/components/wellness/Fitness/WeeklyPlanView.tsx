"use client";

import { Card } from "@/components/wellness/ui/Card";
import type { FitnessPlan, Workout } from "@/lib/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyPlanView({ plan, catalog }: { plan: FitnessPlan; catalog: Workout[] }) {
  const todayDow = new Date().getDay();

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg text-foreground">{plan.title}</h2>
        <span className="text-xs text-muted">weekly schedule</span>
      </div>
      <ul className="flex flex-col divide-y divide-border">
        {DAY_LABELS.map((label, dayIndex) => {
          const entry = plan.weeklySchedule.find((e) => e.dayOfWeek === dayIndex);
          const workout = entry ? catalog.find((w) => w.id === entry.workoutId) : undefined;
          const isToday = dayIndex === todayDow;
          return (
            <li key={label} className={`flex items-center justify-between gap-3 py-2.5 ${isToday ? "rounded-lg bg-primary/5 px-2" : ""}`}>
              <span className={`w-10 text-sm ${isToday ? "font-semibold text-primary" : "text-muted"}`}>{label}</span>
              {workout ? (
                <div className="flex-1 text-right">
                  <p className="text-sm text-foreground">{workout.title}</p>
                  <p className="text-xs text-muted">{workout.durationMin} min</p>
                </div>
              ) : (
                <span className="flex-1 text-right text-sm text-muted">Rest day</span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
