"use client";

import { useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { StreakBadge } from "@/components/wellness/ui/StreakBadge";
import { useWellnessStore } from "@/lib/store";
import { calculateStreak } from "@/lib/wellness/streaks";

export function JournalCalendar({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const entries = useWellnessStore((s) => s.gratitudeEntries);
  const entryDates = new Set(entries.map((e) => e.entryDate));
  const streak = calculateStreak(entries.map((e) => e.entryDate));

  const [monthCursor, setMonthCursor] = useState(new Date());
  const monthStart = startOfMonth(monthCursor);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(monthCursor));

  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = new Date(d.getTime() + 86400000)) {
    days.push(d);
  }

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <button onClick={() => setMonthCursor((m) => subMonths(m, 1))} aria-label="Previous month" className="text-muted hover:text-foreground">
          <ChevronLeft size={18} />
        </button>
        <p className="font-heading text-base text-foreground">{format(monthCursor, "MMMM yyyy")}</p>
        <button onClick={() => setMonthCursor((m) => addMonths(m, 1))} aria-label="Next month" className="text-muted hover:text-foreground">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 text-center text-[11px] text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayKey = format(day, "yyyy-MM-dd");
          const hasEntry = entryDates.has(dayKey);
          const isSelected = dayKey === selectedDate;
          const inMonth = isSameMonth(day, monthCursor);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={dayKey}
              onClick={() => onSelect(dayKey)}
              className={`relative flex h-9 flex-col items-center justify-center rounded-lg text-xs transition ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                  ? "border border-primary text-primary"
                  : inMonth
                  ? "text-foreground hover:bg-primary/10"
                  : "text-muted/40"
              }`}
            >
              {format(day, "d")}
              {hasEntry && !isSelected && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-center">
        <StreakBadge current={streak.current} activeToday={streak.activeToday} />
      </div>
    </Card>
  );
}
