"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { useWellnessStore } from "@/lib/store";
import type { Mood } from "@/lib/types";
import { todaysPrompt } from "@/lib/wellness/seedData";
import type { AppLocale } from "@/lib/wellness/seedData";

const REFLECT_FALLBACK: Record<AppLocale, string> = {
  en: "Reflect on this day",
  ar: "تأمل في هذا اليوم",
};

const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: "great", emoji: "😄", label: "Great" },
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😔", label: "Low" },
  { value: "rough", emoji: "😣", label: "Rough" },
];

export function EntryComposer({ date }: { date: string }) {
  const locale = useWellnessStore((s) => s.locale);
  const entries = useWellnessStore((s) => s.gratitudeEntries);
  const upsertEntry = useWellnessStore((s) => s.upsertGratitudeEntry);
  const existing = entries.find((e) => e.entryDate === date);
  const isToday = date === format(new Date(), "yyyy-MM-dd");

  const [items, setItems] = useState<string[]>(existing?.gratitudeItems ?? []);
  const [itemDraft, setItemDraft] = useState("");
  const [content, setContent] = useState(existing?.content ?? "");
  const [mood, setMood] = useState<Mood>(existing?.mood ?? "good");
  const [saved, setSaved] = useState(false);

  const prompt = existing?.prompt ?? (isToday ? todaysPrompt(locale) : REFLECT_FALLBACK[locale]);

  useEffect(() => {
    setItems(existing?.gratitudeItems ?? []);
    setContent(existing?.content ?? "");
    setMood(existing?.mood ?? "good");
    setSaved(false);
  }, [date, existing]);

  function addItem() {
    if (!itemDraft.trim()) return;
    setItems((prev) => [...prev, itemDraft.trim()]);
    setItemDraft("");
  }

  function handleSave() {
    upsertEntry({ entryDate: date, prompt, gratitudeItems: items, content, mood });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">{format(new Date(date), "EEEE, MMM d")}</p>
      <h2 dir="auto" className="mb-4 font-heading text-lg text-foreground">{prompt}</h2>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-foreground">Gratitude items</p>
        <div className="mb-2 flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="flex items-center gap-1 rounded-pill bg-primary/10 px-3 py-1 text-sm text-primary">
              {item}
              <button onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={itemDraft}
            onChange={(e) => setItemDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem())}
            placeholder="e.g. morning tea"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <button
            onClick={addItem}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary text-primary hover:bg-primary/10"
            aria-label="Add item"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-foreground">Mood</p>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              aria-label={m.label}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition ${
                mood === m.value ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your thoughts..."
        rows={5}
        className="mb-4 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />

      <button
        onClick={handleSave}
        className="w-full rounded-pill bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
      >
        {saved ? "Saved ✓" : existing ? "Update Entry" : "Save Entry"}
      </button>
    </Card>
  );
}
