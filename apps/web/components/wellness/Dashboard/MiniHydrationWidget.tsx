"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { ProgressRing } from "@/components/wellness/ui/ProgressRing";
import { useWellnessStore } from "@/lib/store";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

export function MiniHydrationWidget() {
  const goal = useWellnessStore((s) => s.hydrationGoal);
  const logs = useWellnessStore((s) => s.hydrationLogs);
  const todayMl = logs.filter((l) => isToday(l.loggedAt)).reduce((sum, l) => sum + l.amountMl, 0);
  const percent = Math.round((todayMl / goal.dailyTargetMl) * 100);

  return (
    <Link href="/wellness/hydration">
      <Card className="flex items-center gap-4 transition hover:-translate-y-0.5 hover:shadow-soft">
        <ProgressRing percent={percent} size={72} strokeWidth={8} color="var(--color-primary)">
          <Droplets size={22} className="text-primary" />
        </ProgressRing>
        <div>
          <p className="text-sm text-muted">Hydration</p>
          <p className="font-heading text-lg text-foreground">
            {todayMl} <span className="text-sm font-body text-muted">/ {goal.dailyTargetMl} ml</span>
          </p>
        </div>
      </Card>
    </Link>
  );
}
