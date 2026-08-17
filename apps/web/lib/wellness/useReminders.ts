"use client";

import { useEffect, useRef } from "react";
import { useWellnessStore } from "@/lib/store";

const CHECK_INTERVAL_MS = 60_000; // check once a minute; fires per-user reminderIntervalMin

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/**
 * Client-side reminder scheduler. In production this logic moves server-side
 * (a scheduled job pushing via FCM per ARCHITECTURE.md §2.6), but the trigger
 * rule — "goal not yet met + interval elapsed since last nudge" — stays the
 * same, so this is a faithful local stand-in that also demonstrates the
 * Notifications module end-to-end without needing push infrastructure.
 */
export function useHydrationReminder() {
  const lastNudgeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }

    const timer = window.setInterval(() => {
      const state = useWellnessStore.getState();
      const { hydrationGoal, hydrationLogs, addNotification } = state;
      if (!hydrationGoal.reminderEnabled) return;

      const todayMl = hydrationLogs
        .filter((l) => isToday(l.loggedAt))
        .reduce((sum, l) => sum + l.amountMl, 0);
      if (todayMl >= hydrationGoal.dailyTargetMl) return;

      const elapsedMin = (Date.now() - lastNudgeRef.current) / 60_000;
      if (elapsedMin < hydrationGoal.reminderIntervalMin) return;

      lastNudgeRef.current = Date.now();
      addNotification(
        "wellness_reminder",
        "Time to hydrate 💧",
        `You're at ${todayMl}ml of your ${hydrationGoal.dailyTargetMl}ml goal today.`
      );
    }, CHECK_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);
}
