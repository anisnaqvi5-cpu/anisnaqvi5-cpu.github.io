"use client";

import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { HydrationRing } from "@/components/wellness/Hydration/HydrationRing";
import { HydrationSettings } from "@/components/wellness/Hydration/HydrationSettings";
import { HydrationHistory } from "@/components/wellness/Hydration/HydrationHistory";

function HydrationContent() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Hydration Tracker</h1>
        <p className="text-sm text-muted">Track your water intake, set a goal, and turn on reminders.</p>
      </div>
      <HydrationRing />
      <HydrationSettings />
      <HydrationHistory />
    </div>
  );
}

export default function HydrationPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <HydrationContent />
    </ClientOnly>
  );
}
