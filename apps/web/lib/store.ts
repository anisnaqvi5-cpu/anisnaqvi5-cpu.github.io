"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AppNotification,
  FitnessPlan,
  FitnessProfile,
  GratitudeEntry,
  HydrationGoal,
  HydrationLog,
  MindfulnessLog,
  Mood,
  NotificationType,
  WorkoutLog,
} from "@/lib/types";
import { generateFitnessPlan } from "@/lib/wellness/planGenerator";
import { WORKOUT_CATALOG, type AppLocale } from "@/lib/wellness/seedData";

// -----------------------------------------------------------------------------
// This store is the browser-local, offline-first data layer for the wellness
// modules (see WELLNESS_FEATURES.md for the architecture + privacy rationale).
// Every action here mirrors an endpoint/table from DATABASE_SCHEMA.md
// (fitness_goals, fitness_plans, workout_logs, hydration_goals/logs,
// gratitude_entries, mindfulness_session_logs, notifications) so swapping the
// `persist` storage + these actions for real Supabase calls later is a
// drop-in replacement — component code never talks to `localStorage` directly.
// -----------------------------------------------------------------------------

interface WellnessState {
  // Language — English is the app's primary/default language; Arabic is the
  // only supported secondary language. Scripts are never mixed within a
  // single string (see WELLNESS_FEATURES.md's note on this).
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;

  // Fitness
  fitnessProfile: FitnessProfile | null;
  fitnessPlans: FitnessPlan[];
  workoutLogs: WorkoutLog[];
  setFitnessProfileAndGeneratePlan: (profile: FitnessProfile) => void;
  logWorkout: (entry: Omit<WorkoutLog, "id" | "loggedAt"> & { loggedAt?: string }) => void;
  deleteWorkoutLog: (id: string) => void;

  // Hydration
  hydrationGoal: HydrationGoal;
  hydrationLogs: HydrationLog[];
  setHydrationGoal: (goal: Partial<HydrationGoal>) => void;
  logWater: (amountMl: number) => void;
  deleteHydrationLog: (id: string) => void;

  // Gratitude journal
  gratitudeEntries: GratitudeEntry[];
  upsertGratitudeEntry: (entry: {
    entryDate: string;
    prompt: string;
    gratitudeItems: string[];
    content: string;
    mood: Mood;
  }) => void;
  deleteGratitudeEntry: (id: string) => void;

  // Mindfulness
  mindfulnessLogs: MindfulnessLog[];
  logMindfulnessSession: (sessionId: string, durationListenedSec: number, completed: boolean) => void;

  // Notifications
  notifications: AppNotification[];
  addNotification: (type: NotificationType, title: string, body: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Privacy controls (right to export/delete — see WELLNESS_FEATURES.md §Privacy)
  exportAllData: () => string;
  clearAllWellnessData: () => void;
}

const DEFAULT_HYDRATION_GOAL: HydrationGoal = {
  dailyTargetMl: 2000,
  reminderEnabled: true,
  reminderIntervalMin: 120,
};

export const useWellnessStore = create<WellnessState>()(
  persist(
    (set, get) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),

      fitnessProfile: null,
      fitnessPlans: [],
      workoutLogs: [],

      setFitnessProfileAndGeneratePlan: (profile) => {
        const plan = generateFitnessPlan(profile, WORKOUT_CATALOG);
        set((state) => ({
          fitnessProfile: profile,
          fitnessPlans: [...state.fitnessPlans.map((p) => ({ ...p, isActive: false })), plan],
        }));
        get().addNotification(
          "wellness_reminder",
          "Your new fitness plan is ready",
          `We built a personalized "${plan.title}" plan based on your goals.`
        );
      },

      logWorkout: (entry) => {
        const log: WorkoutLog = {
          id: crypto.randomUUID(),
          loggedAt: entry.loggedAt ?? new Date().toISOString(),
          workoutId: entry.workoutId,
          activityType: entry.activityType,
          durationMin: entry.durationMin,
          caloriesBurned: entry.caloriesBurned,
          notes: entry.notes,
        };
        set((state) => ({ workoutLogs: [log, ...state.workoutLogs] }));
      },

      deleteWorkoutLog: (id) =>
        set((state) => ({ workoutLogs: state.workoutLogs.filter((l) => l.id !== id) })),

      hydrationGoal: DEFAULT_HYDRATION_GOAL,
      hydrationLogs: [],

      setHydrationGoal: (goal) =>
        set((state) => ({ hydrationGoal: { ...state.hydrationGoal, ...goal } })),

      logWater: (amountMl) => {
        const log: HydrationLog = { id: crypto.randomUUID(), amountMl, loggedAt: new Date().toISOString() };
        set((state) => ({ hydrationLogs: [log, ...state.hydrationLogs] }));
      },

      deleteHydrationLog: (id) =>
        set((state) => ({ hydrationLogs: state.hydrationLogs.filter((l) => l.id !== id) })),

      gratitudeEntries: [],

      upsertGratitudeEntry: (entry) =>
        set((state) => {
          const existing = state.gratitudeEntries.find((e) => e.entryDate === entry.entryDate);
          const now = new Date().toISOString();
          if (existing) {
            return {
              gratitudeEntries: state.gratitudeEntries.map((e) =>
                e.entryDate === entry.entryDate ? { ...e, ...entry, updatedAt: now } : e
              ),
            };
          }
          const created: GratitudeEntry = {
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            ...entry,
          };
          return { gratitudeEntries: [created, ...state.gratitudeEntries] };
        }),

      deleteGratitudeEntry: (id) =>
        set((state) => ({ gratitudeEntries: state.gratitudeEntries.filter((e) => e.id !== id) })),

      mindfulnessLogs: [],

      logMindfulnessSession: (sessionId, durationListenedSec, completed) => {
        const log: MindfulnessLog = {
          id: crypto.randomUUID(),
          sessionId,
          durationListenedSec,
          completed,
          loggedAt: new Date().toISOString(),
        };
        set((state) => ({ mindfulnessLogs: [log, ...state.mindfulnessLogs] }));
      },

      notifications: [],

      addNotification: (type, title, body) => {
        const notification: AppNotification = {
          id: crypto.randomUUID(),
          type,
          title,
          body,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ notifications: [notification, ...state.notifications].slice(0, 50) }));
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(title, { body });
          } catch {
            // best-effort only
          }
        }
      },

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, isRead: true })) })),

      exportAllData: () => {
        const state = get();
        const payload = {
          fitnessProfile: state.fitnessProfile,
          fitnessPlans: state.fitnessPlans,
          workoutLogs: state.workoutLogs,
          hydrationGoal: state.hydrationGoal,
          hydrationLogs: state.hydrationLogs,
          gratitudeEntries: state.gratitudeEntries,
          mindfulnessLogs: state.mindfulnessLogs,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(payload, null, 2);
      },

      clearAllWellnessData: () =>
        set({
          fitnessProfile: null,
          fitnessPlans: [],
          workoutLogs: [],
          hydrationGoal: DEFAULT_HYDRATION_GOAL,
          hydrationLogs: [],
          gratitudeEntries: [],
          mindfulnessLogs: [],
          notifications: [],
        }),
    }),
    {
      name: "wellness-app-store",
      version: 1,
    }
  )
);

export function getActivePlan(state: Pick<WellnessState, "fitnessPlans">): FitnessPlan | null {
  return state.fitnessPlans.find((p) => p.isActive) ?? null;
}
