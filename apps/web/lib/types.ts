// Client-side types mirroring DATABASE_SCHEMA.md's wellness domain tables
// (fitness_goals, fitness_plans, workouts, workout_logs, hydration_goals,
// hydration_logs, gratitude_entries, mindfulness_sessions,
// mindfulness_session_logs, notifications). Field names use camelCase here;
// a Supabase-backed repository would map 1:1 to the snake_case columns.

export type ActivityType =
  | "yoga"
  | "walk"
  | "run"
  | "gym"
  | "cycling"
  | "swimming"
  | "other";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type WorkoutLocation = "home" | "gym" | "outdoor" | "any";
export type GoalType =
  | "weight_loss"
  | "flexibility"
  | "strength"
  | "general_activity"
  | "stress_relief";

export interface FitnessProfile {
  goalType: GoalType;
  experienceLevel: ExperienceLevel;
  availableDays: number[]; // 0=Sun ... 6=Sat
  workoutDurationMin: number;
  location: WorkoutLocation;
  preference: ActivityType[];
  updatedAt: string;
}

export interface Workout {
  id: string;
  title: string;
  activityType: ActivityType;
  description: string;
  durationMin: number;
  difficulty: ExperienceLevel;
  location: WorkoutLocation;
  caloriesEstimate: number;
}

export interface FitnessPlanEntry {
  dayOfWeek: number;
  workoutId: string;
}

export interface FitnessPlan {
  id: string;
  title: string;
  goalType: GoalType;
  weeklySchedule: FitnessPlanEntry[];
  createdAt: string;
  isActive: boolean;
}

export interface WorkoutLog {
  id: string;
  workoutId?: string;
  activityType: ActivityType;
  durationMin: number;
  caloriesBurned?: number;
  notes?: string;
  loggedAt: string; // ISO timestamp
}

export interface HydrationGoal {
  dailyTargetMl: number;
  reminderEnabled: boolean;
  reminderIntervalMin: number;
}

export interface HydrationLog {
  id: string;
  amountMl: number;
  loggedAt: string; // ISO timestamp
}

export type Mood = "great" | "good" | "okay" | "low" | "rough";

export interface GratitudeEntry {
  id: string;
  entryDate: string; // yyyy-MM-dd, one per day
  prompt: string;
  gratitudeItems: string[];
  content: string;
  mood: Mood;
  createdAt: string;
  updatedAt: string;
}

export type MindfulnessCategory = "breathing" | "body_scan" | "sleep" | "focus";

export interface MindfulnessSession {
  id: string;
  title: string;
  category: MindfulnessCategory;
  description: string;
  durationSec: number;
  breathingPattern?: { inhale: number; hold: number; exhale: number; holdAfter?: number };
}

export interface MindfulnessLog {
  id: string;
  sessionId: string;
  durationListenedSec: number;
  completed: boolean;
  loggedAt: string;
}

export type NotificationType =
  | "wellness_reminder"
  | "order_update"
  | "promotion"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface StreakInfo {
  current: number;
  longest: number;
  activeToday: boolean;
}
