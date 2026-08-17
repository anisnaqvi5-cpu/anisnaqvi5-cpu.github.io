"use client";

import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/wellness/ui/Card";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { useWellnessStore } from "@/lib/store";

export function WorkoutHistory() {
  const workoutLogs = useWellnessStore((s) => s.workoutLogs);
  const deleteWorkoutLog = useWellnessStore((s) => s.deleteWorkoutLog);

  return (
    <Card>
      <h2 className="mb-3 font-heading text-lg text-foreground">Activity History</h2>
      {workoutLogs.length === 0 ? (
        <EmptyState title="No activity logged yet" description="Log your first workout to start building a streak." />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {workoutLogs.map((log) => (
            <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
              <div>
                <p className="text-sm font-medium capitalize text-foreground">{log.activityType}</p>
                <p className="text-xs text-muted">
                  {log.durationMin} min · {format(new Date(log.loggedAt), "MMM d, h:mm a")}
                  {log.caloriesBurned ? ` · ${log.caloriesBurned} kcal` : ""}
                </p>
              </div>
              <button
                onClick={() => deleteWorkoutLog(log.id)}
                aria-label="Delete log"
                className="text-muted transition hover:text-danger"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
