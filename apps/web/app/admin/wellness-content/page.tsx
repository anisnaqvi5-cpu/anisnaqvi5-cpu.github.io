"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useAdminGuard } from "@/components/admin/useAdminGuard";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { adminApi } from "@/lib/adminApi";
import type { Workout, MindfulnessSession } from "@/lib/types";
import type { GratitudePromptRecord } from "@/lib/server/db";

function WorkoutsPanel() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [title, setTitle] = useState("");
  const [activityType, setActivityType] = useState<Workout["activityType"]>("walk");
  const [durationMin, setDurationMin] = useState(30);
  const [difficulty, setDifficulty] = useState<Workout["difficulty"]>("beginner");
  const [location, setLocation] = useState<Workout["location"]>("any");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await adminApi.listWorkouts();
    setWorkouts(res.workouts);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    await adminApi.createWorkout({ title, activityType, description: "", durationMin, difficulty, location, caloriesEstimate: durationMin * 6 });
    setTitle("");
    await load();
  }
  async function remove(id: string) {
    await adminApi.deleteWorkout(id);
    await load();
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="mb-3 font-heading text-base text-foreground">Workouts</h2>
      <form onSubmit={add} className="mb-3 flex flex-wrap items-end gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <select value={activityType} onChange={(e) => setActivityType(e.target.value as Workout["activityType"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {(["yoga", "walk", "run", "gym", "cycling", "swimming", "other"] as const).map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Workout["difficulty"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {(["beginner", "intermediate", "advanced"] as const).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value as Workout["location"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {(["home", "gym", "outdoor", "any"] as const).map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <input type="number" value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
      </form>
      <ul className="flex flex-col gap-1.5">
        {workouts.map((w) => (
          <li key={w.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
            <span className="text-foreground">{w.title} <span className="text-xs text-muted">({w.activityType}, {w.durationMin}min, {w.difficulty}, {w.location})</span></span>
            <button onClick={() => remove(w.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function MindfulnessPanel() {
  const [sessions, setSessions] = useState<MindfulnessSession[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<MindfulnessSession["category"]>("breathing");
  const [durationSec, setDurationSec] = useState(180);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await adminApi.listMindfulness();
    setSessions(res.sessions);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    await adminApi.createMindfulness({ title, category, description: "", durationSec });
    setTitle("");
    await load();
  }
  async function remove(id: string) {
    await adminApi.deleteMindfulness(id);
    await load();
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="mb-3 font-heading text-base text-foreground">Mindfulness Sessions</h2>
      <form onSubmit={add} className="mb-3 flex flex-wrap items-end gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <select value={category} onChange={(e) => setCategory(e.target.value as MindfulnessSession["category"])} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
          {(["breathing", "body_scan", "sleep", "focus"] as const).map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="number" value={durationSec} onChange={(e) => setDurationSec(Number(e.target.value))} className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
      </form>
      <ul className="flex flex-col gap-1.5">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
            <span className="text-foreground">{s.title} <span className="text-xs text-muted">({s.category}, {Math.round(s.durationSec / 60)}min)</span></span>
            <button onClick={() => remove(s.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PromptsPanel() {
  const [prompts, setPrompts] = useState<GratitudePromptRecord[]>([]);
  const [text, setText] = useState("");
  const [textAr, setTextAr] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await adminApi.listPrompts();
    setPrompts(res.prompts);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text) return;
    await adminApi.createPrompt({ text, textAr });
    setText("");
    setTextAr("");
    await load();
  }
  async function toggle(p: GratitudePromptRecord) {
    await adminApi.updatePrompt(p.id, { isActive: !p.isActive });
    await load();
  }
  async function remove(id: string) {
    await adminApi.deletePrompt(id);
    await load();
  }

  if (loading) return null;

  return (
    <Card>
      <h2 className="mb-3 font-heading text-base text-foreground">Gratitude Journal Prompts</h2>
      <form onSubmit={add} className="mb-3 flex flex-col gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Prompt (English)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <input dir="auto" value={textAr} onChange={(e) => setTextAr(e.target.value)} placeholder="Prompt (Arabic)" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        <button className="self-start rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add</button>
      </form>
      <ul className="flex flex-col gap-1.5">
        {prompts.map((p) => (
          <li key={p.id} className="flex items-center justify-between rounded-lg border border-border p-2 text-sm">
            <span className="text-foreground">{p.text}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => toggle(p)} className={`rounded-pill px-2 py-0.5 text-xs ${p.isActive ? "bg-primary/10 text-primary" : "bg-muted/10 text-muted"}`}>
                {p.isActive ? "Active" : "Inactive"}
              </button>
              <button onClick={() => remove(p.id)} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function AdminWellnessContentContent() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl text-foreground">Wellness Content</h1>
      <WorkoutsPanel />
      <MindfulnessPanel />
      <PromptsPanel />
    </div>
  );
}

export default function AdminWellnessContentPage() {
  const { checking } = useAdminGuard("wellness_content");
  if (checking) return <DashboardSkeleton />;
  return <AdminWellnessContentContent />;
}
