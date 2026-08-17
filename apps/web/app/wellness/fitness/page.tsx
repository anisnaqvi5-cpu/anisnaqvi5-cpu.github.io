"use client";

import { useState } from "react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { GoalWizard } from "@/components/wellness/Fitness/GoalWizard";
import { WeeklyPlanView } from "@/components/wellness/Fitness/WeeklyPlanView";
import { LogWorkoutForm } from "@/components/wellness/Fitness/LogWorkoutForm";
import { WorkoutHistory } from "@/components/wellness/Fitness/WorkoutHistory";
import { getActivePlan, useWellnessStore } from "@/lib/store";
import { WORKOUT_CATALOG } from "@/lib/wellness/seedData";

function FitnessContent() {
  const fitnessProfile = useWellnessStore((s) => s.fitnessProfile);
  const fitnessPlans = useWellnessStore((s) => s.fitnessPlans);
  const activePlan = getActivePlan({ fitnessPlans });
  const [editing, setEditing] = useState(!fitnessProfile);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Fitness Planner</h1>
          <p className="text-sm text-muted">Personalized plan + activity tracking.</p>
        </div>
        {fitnessProfile && (
          <button
            onClick={() => setEditing((v) => !v)}
            className="rounded-pill border border-border px-3 py-1.5 text-sm text-foreground hover:bg-primary/5"
          >
            {editing ? "Cancel" : "Edit Goals"}
          </button>
        )}
      </div>

      {editing ? (
        <GoalWizard existing={fitnessProfile} onSaved={() => setEditing(false)} />
      ) : (
        activePlan && <WeeklyPlanView plan={activePlan} catalog={WORKOUT_CATALOG} />
      )}

      {fitnessProfile && !editing && (
        <>
          <LogWorkoutForm />
          <WorkoutHistory />
        </>
      )}
    </div>
  );
}

export default function FitnessPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <FitnessContent />
    </ClientOnly>
  );
}
