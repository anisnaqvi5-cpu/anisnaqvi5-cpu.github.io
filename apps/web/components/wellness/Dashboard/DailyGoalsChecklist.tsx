"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import type { DailyGoal } from "@/lib/wellness/dailyGoals";

export function DailyGoalsChecklist({ goals }: { goals: DailyGoal[] }) {
  const doneCount = goals.filter((g) => g.done).length;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-lg text-foreground">Today&apos;s Goals</h2>
        <span className="text-sm text-muted">
          {doneCount}/{goals.length} done
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {goals.map((goal) => (
          <li key={goal.id} className="flex items-start gap-3">
            {goal.done ? (
              <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-primary" />
            ) : (
              <Circle size={20} className="mt-0.5 shrink-0 text-muted/50" />
            )}
            <div>
              <p className={`text-sm ${goal.done ? "text-muted line-through" : "text-foreground"}`}>{goal.label}</p>
              <p className="text-xs text-muted">{goal.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
