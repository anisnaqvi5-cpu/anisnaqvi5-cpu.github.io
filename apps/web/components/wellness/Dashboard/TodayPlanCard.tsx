"use client";

import Link from "next/link";
import { Card } from "@/components/wellness/ui/Card";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import type { FitnessPlan, Workout } from "@/lib/types";

export function TodayPlanCard({ plan, catalog }: { plan: FitnessPlan | null; catalog: Workout[] }) {
  if (!plan) {
    return (
      <Card>
        <h2 className="mb-3 font-heading text-lg text-foreground">Today&apos;s Plan</h2>
        <EmptyState
          title="No fitness plan yet"
          description="Tell us your goals and we'll build a personalized weekly plan for you."
          action={
            <Link href="/wellness/fitness" className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
              Create My Plan
            </Link>
          }
        />
      </Card>
    );
  }

  const todayDow = new Date().getDay();
  const entry = plan.weeklySchedule.find((e) => e.dayOfWeek === todayDow);
  const workout = entry ? catalog.find((w) => w.id === entry.workoutId) : undefined;

  return (
    <Card>
      <h2 className="mb-3 font-heading text-lg text-foreground">Today&apos;s Plan</h2>
      {workout ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">{workout.title}</p>
            <p className="text-sm text-muted">
              {workout.durationMin} min · {workout.difficulty} · {workout.location}
            </p>
          </div>
          <Link
            href="/wellness/fitness"
            className="shrink-0 rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            View
          </Link>
        </div>
      ) : (
        <p className="text-sm text-muted">Today is a rest day — relax, or do something light if you feel like it.</p>
      )}
    </Card>
  );
}
