"use client";

import { useState } from "react";
import { Droplets, Minus, Plus } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { ProgressRing } from "@/components/wellness/ui/ProgressRing";
import { useWellnessStore } from "@/lib/store";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

const QUICK_AMOUNTS = [150, 250, 500];

export function HydrationRing() {
  const goal = useWellnessStore((s) => s.hydrationGoal);
  const logs = useWellnessStore((s) => s.hydrationLogs);
  const logWater = useWellnessStore((s) => s.logWater);
  const [customAmount, setCustomAmount] = useState(200);

  const todayMl = logs.filter((l) => isToday(l.loggedAt)).reduce((sum, l) => sum + l.amountMl, 0);
  const percent = Math.round((todayMl / goal.dailyTargetMl) * 100);

  return (
    <Card className="flex flex-col items-center gap-5 text-center">
      <ProgressRing percent={percent} size={200} strokeWidth={16}>
        <div className="flex flex-col items-center">
          <Droplets size={28} className="mb-1 text-primary" />
          <p className="font-heading text-2xl text-foreground">{todayMl}ml</p>
          <p className="text-xs text-muted">of {goal.dailyTargetMl}ml ({percent}%)</p>
        </div>
      </ProgressRing>

      <div className="flex flex-wrap justify-center gap-2">
        {QUICK_AMOUNTS.map((amt) => (
          <button
            key={amt}
            onClick={() => logWater(amt)}
            className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            +{amt}ml
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCustomAmount((v) => Math.max(50, v - 50))}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:bg-primary/5"
          aria-label="Decrease"
        >
          <Minus size={14} />
        </button>
        <span className="w-20 text-sm text-foreground">{customAmount}ml</span>
        <button
          onClick={() => setCustomAmount((v) => v + 50)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted hover:bg-primary/5"
          aria-label="Increase"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => logWater(customAmount)}
          className="ml-2 rounded-pill border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10"
        >
          Add
        </button>
      </div>
    </Card>
  );
}
