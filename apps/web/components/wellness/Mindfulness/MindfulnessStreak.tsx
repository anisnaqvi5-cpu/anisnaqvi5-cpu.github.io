"use client";

import { Card } from "@/components/wellness/ui/Card";
import { StreakBadge } from "@/components/wellness/ui/StreakBadge";
import { useWellnessStore } from "@/lib/store";
import { calculateStreak } from "@/lib/wellness/streaks";

export function MindfulnessStreak() {
  const logs = useWellnessStore((s) => s.mindfulnessLogs);
  const streak = calculateStreak(logs.filter((l) => l.completed).map((l) => l.loggedAt));
  const totalMinutes = Math.round(logs.reduce((sum, l) => sum + l.durationListenedSec, 0) / 60);

  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted">Total mindful minutes</p>
        <p className="font-heading text-xl text-foreground">{totalMinutes} min</p>
      </div>
      <StreakBadge current={streak.current} activeToday={streak.activeToday} />
    </Card>
  );
}
