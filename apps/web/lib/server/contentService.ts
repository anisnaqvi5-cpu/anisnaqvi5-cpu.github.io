import crypto from "node:crypto";
import type { FontRecord, QuoteRecord } from "@/lib/ecommerce/types";
import type { MindfulnessSession, Workout } from "@/lib/types";
import { readDb, withDb } from "@/lib/server/db";
import type { GratitudePromptRecord } from "@/lib/server/db";
import { OrderError } from "@/lib/server/errors";

// Wellness content — admin-managed source of truth, served publicly via
// GET /api/wellness/content so the wellness app's fitness/mindfulness/journal
// pages can use live data instead of only their bundled seed (see
// apps/web/lib/wellness/seedData.ts, kept as the fallback/initial seed).

export function listWorkouts(): Workout[] {
  return readDb((db) => db.workouts);
}

export async function createWorkout(input: Omit<Workout, "id">): Promise<Workout> {
  return withDb((db) => {
    const workout: Workout = { ...input, id: crypto.randomUUID() };
    db.workouts.push(workout);
    return workout;
  });
}

export async function updateWorkout(id: string, patch: Partial<Omit<Workout, "id">>): Promise<Workout> {
  return withDb((db) => {
    const workout = db.workouts.find((w) => w.id === id);
    if (!workout) throw new OrderError("not_found", "Workout not found.");
    Object.assign(workout, patch);
    return workout;
  });
}

export async function deleteWorkout(id: string): Promise<void> {
  await withDb((db) => {
    db.workouts = db.workouts.filter((w) => w.id !== id);
  });
}

export function listMindfulnessSessions(): MindfulnessSession[] {
  return readDb((db) => db.mindfulnessSessions);
}

export async function createMindfulnessSession(input: Omit<MindfulnessSession, "id">): Promise<MindfulnessSession> {
  return withDb((db) => {
    const session: MindfulnessSession = { ...input, id: crypto.randomUUID() };
    db.mindfulnessSessions.push(session);
    return session;
  });
}

export async function updateMindfulnessSession(id: string, patch: Partial<Omit<MindfulnessSession, "id">>): Promise<MindfulnessSession> {
  return withDb((db) => {
    const session = db.mindfulnessSessions.find((s) => s.id === id);
    if (!session) throw new OrderError("not_found", "Session not found.");
    Object.assign(session, patch);
    return session;
  });
}

export async function deleteMindfulnessSession(id: string): Promise<void> {
  await withDb((db) => {
    db.mindfulnessSessions = db.mindfulnessSessions.filter((s) => s.id !== id);
  });
}

export function listGratitudePrompts(): GratitudePromptRecord[] {
  return readDb((db) => db.gratitudePrompts);
}

export async function createGratitudePrompt(text: string, textAr: string): Promise<GratitudePromptRecord> {
  return withDb((db) => {
    const prompt: GratitudePromptRecord = { id: crypto.randomUUID(), text, textAr, isActive: true };
    db.gratitudePrompts.push(prompt);
    return prompt;
  });
}

export async function updateGratitudePrompt(id: string, patch: Partial<Omit<GratitudePromptRecord, "id">>): Promise<GratitudePromptRecord> {
  return withDb((db) => {
    const prompt = db.gratitudePrompts.find((p) => p.id === id);
    if (!prompt) throw new OrderError("not_found", "Prompt not found.");
    Object.assign(prompt, patch);
    return prompt;
  });
}

export async function deleteGratitudePrompt(id: string): Promise<void> {
  await withDb((db) => {
    db.gratitudePrompts = db.gratitudePrompts.filter((p) => p.id !== id);
  });
}

// ---- Customization library: fonts + quotes ---------------------------------
export function listFonts(): FontRecord[] {
  return readDb((db) => db.fonts);
}

export async function createFont(input: Omit<FontRecord, "id">): Promise<FontRecord> {
  return withDb((db) => {
    const font: FontRecord = { ...input, id: crypto.randomUUID() };
    db.fonts.push(font);
    return font;
  });
}

export async function updateFont(id: string, patch: Partial<Omit<FontRecord, "id">>): Promise<FontRecord> {
  return withDb((db) => {
    const font = db.fonts.find((f) => f.id === id);
    if (!font) throw new OrderError("not_found", "Font not found.");
    Object.assign(font, patch);
    return font;
  });
}

export async function deleteFont(id: string): Promise<void> {
  await withDb((db) => {
    db.fonts = db.fonts.filter((f) => f.id !== id);
  });
}

export function listQuotes(): QuoteRecord[] {
  return readDb((db) => db.quotes);
}

export async function createQuote(input: Omit<QuoteRecord, "id">): Promise<QuoteRecord> {
  return withDb((db) => {
    const quote: QuoteRecord = { ...input, id: crypto.randomUUID() };
    db.quotes.push(quote);
    return quote;
  });
}

export async function updateQuote(id: string, patch: Partial<Omit<QuoteRecord, "id">>): Promise<QuoteRecord> {
  return withDb((db) => {
    const quote = db.quotes.find((q) => q.id === id);
    if (!quote) throw new OrderError("not_found", "Quote not found.");
    Object.assign(quote, patch);
    return quote;
  });
}

export async function deleteQuote(id: string): Promise<void> {
  await withDb((db) => {
    db.quotes = db.quotes.filter((q) => q.id !== id);
  });
}
