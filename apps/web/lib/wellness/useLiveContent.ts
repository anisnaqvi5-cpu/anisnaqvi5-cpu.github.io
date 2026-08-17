"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { MindfulnessSession, Workout } from "@/lib/types";
import { GRATITUDE_PROMPTS, GRATITUDE_PROMPTS_AR, MINDFULNESS_CATALOG, WORKOUT_CATALOG } from "@/lib/wellness/seedData";

// Live wellness content fetched from /api/wellness/content (managed by the
// Content Manager role via /admin/wellness-content), with the bundled seed
// data as an instant fallback.
interface LiveContentState {
  workouts: Workout[];
  mindfulnessSessions: MindfulnessSession[];
  promptsEn: string[];
  promptsAr: string[];
  loaded: boolean;
  fetchContent: () => Promise<void>;
}

export const useLiveContentStore = create<LiveContentState>((set, get) => ({
  workouts: WORKOUT_CATALOG,
  mindfulnessSessions: MINDFULNESS_CATALOG,
  promptsEn: GRATITUDE_PROMPTS,
  promptsAr: GRATITUDE_PROMPTS_AR,
  loaded: false,
  fetchContent: async () => {
    if (get().loaded) return;
    try {
      const res = await fetch("/api/wellness/content");
      if (!res.ok) return;
      const data = await res.json();
      set({
        workouts: data.workouts?.length ? data.workouts : WORKOUT_CATALOG,
        mindfulnessSessions: data.mindfulnessSessions?.length ? data.mindfulnessSessions : MINDFULNESS_CATALOG,
        promptsEn: data.prompts?.en?.length ? data.prompts.en : GRATITUDE_PROMPTS,
        promptsAr: data.prompts?.ar?.length ? data.prompts.ar : GRATITUDE_PROMPTS_AR,
        loaded: true,
      });
    } catch {
      // keep the seed fallback
    }
  },
}));

export function useEnsureLiveContent() {
  const fetchContent = useLiveContentStore((s) => s.fetchContent);
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);
}

export function todaysLivePrompt(promptsEn: string[], promptsAr: string[], locale: "en" | "ar"): string {
  const list = locale === "ar" ? promptsAr : promptsEn;
  if (list.length === 0) return "";
  const dayIndex = new Date().getDate() % list.length;
  return list[dayIndex];
}
