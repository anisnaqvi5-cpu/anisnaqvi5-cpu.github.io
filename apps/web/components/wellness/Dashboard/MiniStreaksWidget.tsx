"use client";

import Link from "next/link";
import { Card } from "@/components/wellness/ui/Card";
import { StreakBadge } from "@/components/wellness/ui/StreakBadge";
import { useWellnessStore } from "@/lib/store";
import { calculateStreak } from "@/lib/wellness/streaks";

export function MiniStreaksWidget() {
  const hydrationLogs = useWellnessStore((s) => s.hydrationLogs);
  const gratitudeEntries = useWellnessStore((s) => s.gratitudeEntries);
  const mindfulnessLogs = useWellnessStore((s) => s.mindfulnessLogs);
  const workoutLogs = useWellnessStore((s) => s.workoutLogs);

  const hydrationStreak = calculateStreak(hydrationLogs.map((l) => l.loggedAt));
  const journalStreak = calculateStreak(gratitudeEntries.map((e) => e.entryDate));
  const mindfulnessStreak = calculateStreak(mindfulnessLogs.filter((l) => l.completed).map((l) => l.loggedAt));
  const fitnessStreak = calculateStreak(workoutLogs.map((l) => l.loggedAt));

  const rows = [
    { label: "Hydration", href: "/wellness/hydration", streak: hydrationStreak },
    { label: "Journal", href: "/wellness/journal", streak: journalStreak },
    { label: "Mindfulness", href: "/wellness/mindfulness", streak: mindfulnessStreak },
    { label: "Fitness", href: "/wellness/fitness", streak: fitnessStreak },
  ];

  return (
    <Card>
      <h2 className="mb-3 font-heading text-lg text-foreground">Your Streaks</h2>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.label}>
            <Link href={row.href} className="flex items-center justify-between">
              <span className="text-sm text-foreground">{row.label}</span>
              <StreakBadge current={row.streak.current} activeToday={row.streak.activeToday} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
