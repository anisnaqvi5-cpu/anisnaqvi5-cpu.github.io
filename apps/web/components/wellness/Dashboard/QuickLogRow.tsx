"use client";

import Link from "next/link";
import { Droplets, Dumbbell, NotebookPen, Wind } from "lucide-react";
import { useWellnessStore } from "@/lib/store";

export function QuickLogRow() {
  const logWater = useWellnessStore((s) => s.logWater);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => logWater(250)}
        className="flex shrink-0 items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:bg-primary/10"
      >
        <Droplets size={16} className="text-primary" /> +250ml Water
      </button>
      <Link
        href="/wellness/journal"
        className="flex shrink-0 items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:bg-primary/10"
      >
        <NotebookPen size={16} className="text-primary" /> New Journal Entry
      </Link>
      <Link
        href="/wellness/fitness"
        className="flex shrink-0 items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:bg-primary/10"
      >
        <Dumbbell size={16} className="text-primary" /> Log Workout
      </Link>
      <Link
        href="/wellness/mindfulness"
        className="flex shrink-0 items-center gap-2 rounded-pill border border-border bg-surface px-4 py-2 text-sm text-foreground transition hover:bg-primary/10"
      >
        <Wind size={16} className="text-primary" /> Breathe
      </Link>
    </div>
  );
}
