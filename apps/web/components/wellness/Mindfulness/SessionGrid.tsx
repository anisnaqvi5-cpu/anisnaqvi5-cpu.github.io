"use client";

import { Card } from "@/components/wellness/ui/Card";
import { MINDFULNESS_CATALOG } from "@/lib/wellness/seedData";
import type { MindfulnessCategory, MindfulnessSession } from "@/lib/types";

const CATEGORY_LABEL: Record<MindfulnessCategory, string> = {
  breathing: "Breathing",
  body_scan: "Body Scan",
  sleep: "Sleep",
  focus: "Focus",
};

export function SessionGrid({ onSelect }: { onSelect: (session: MindfulnessSession) => void }) {
  const categories = Array.from(new Set(MINDFULNESS_CATALOG.map((s) => s.category)));

  return (
    <div className="flex flex-col gap-5">
      {categories.map((cat) => (
        <div key={cat}>
          <h2 className="mb-2 font-heading text-base text-foreground">{CATEGORY_LABEL[cat]}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {MINDFULNESS_CATALOG.filter((s) => s.category === cat).map((session) => (
              <button key={session.id} onClick={() => onSelect(session)} className="text-left">
                <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
                  <p className="font-medium text-foreground">{session.title}</p>
                  <p className="mt-1 text-sm text-muted">{session.description}</p>
                  <p className="mt-2 text-xs text-primary">{Math.round(session.durationSec / 60)} min</p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
