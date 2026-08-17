import { Flame } from "lucide-react";

export function StreakBadge({ current, activeToday }: { current: number; activeToday: boolean }) {
  if (current === 0) {
    return <span className="text-sm text-muted">No streak yet — start today</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill px-3 py-1 text-sm font-medium ${
        activeToday ? "bg-accent/15 text-accent" : "bg-muted/10 text-muted"
      }`}
    >
      <Flame size={16} className={activeToday ? "text-accent" : "text-muted"} />
      {current} day{current === 1 ? "" : "s"} streak
    </span>
  );
}
