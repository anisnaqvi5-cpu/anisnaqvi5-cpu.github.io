"use client";

import { Trash2 } from "lucide-react";
import { format, subDays } from "date-fns";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/wellness/ui/Card";
import { EmptyState } from "@/components/wellness/ui/EmptyState";
import { useWellnessStore } from "@/lib/store";

export function HydrationHistory() {
  const logs = useWellnessStore((s) => s.hydrationLogs);
  const deleteLog = useWellnessStore((s) => s.deleteHydrationLog);
  const goal = useWellnessStore((s) => s.hydrationGoal);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayKey = format(date, "yyyy-MM-dd");
    const total = logs
      .filter((l) => format(new Date(l.loggedAt), "yyyy-MM-dd") === dayKey)
      .reduce((sum, l) => sum + l.amountMl, 0);
    return { day: format(date, "EEE"), ml: total };
  });

  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime())
    .slice(0, 8);

  return (
    <>
      <Card>
        <h2 className="mb-3 font-heading text-lg text-foreground">Weekly History</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--color-border)", opacity: 0.3 }}
                contentStyle={{ borderRadius: 12, borderColor: "var(--color-border)", fontSize: 12 }}
              />
              <Bar dataKey="ml" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 text-center text-xs text-muted">Daily target: {goal.dailyTargetMl}ml</p>
      </Card>

      <Card>
        <h2 className="mb-3 font-heading text-lg text-foreground">Recent Logs</h2>
        {recentLogs.length === 0 ? (
          <EmptyState title="No logs yet" description="Log your first glass and start today's journey." />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {recentLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{log.amountMl}ml</span>
                <span className="text-muted">{format(new Date(log.loggedAt), "MMM d, h:mm a")}</span>
                <button onClick={() => deleteLog(log.id)} aria-label="Delete" className="text-muted hover:text-danger">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
