"use client";

import { useState } from "react";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { SessionGrid } from "@/components/wellness/Mindfulness/SessionGrid";
import { BreathingPlayer } from "@/components/wellness/Mindfulness/BreathingPlayer";
import { MindfulnessStreak } from "@/components/wellness/Mindfulness/MindfulnessStreak";
import type { MindfulnessSession } from "@/lib/types";

function MindfulnessContent() {
  const [active, setActive] = useState<MindfulnessSession | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Mindfulness</h1>
        <p className="text-sm text-muted">A few minutes of calm — breathing, body scan and focus sessions.</p>
      </div>

      <MindfulnessStreak />

      {active ? (
        <BreathingPlayer session={active} onExit={() => setActive(null)} />
      ) : (
        <SessionGrid onSelect={setActive} />
      )}
    </div>
  );
}

export default function MindfulnessPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <MindfulnessContent />
    </ClientOnly>
  );
}
