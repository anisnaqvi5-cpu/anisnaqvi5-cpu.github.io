"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { Card } from "@/components/wellness/ui/Card";
import { MiniStreaksWidget } from "@/components/wellness/Dashboard/MiniStreaksWidget";
import { PrivacyControls } from "@/components/wellness/Dashboard/PrivacyControls";
import { useWellnessStore } from "@/lib/store";
import { buildDailySeries } from "@/lib/wellness/progress";

const chartTooltipStyle = { borderRadius: 12, borderColor: "var(--color-border)", fontSize: 12 };
const axisTick = { fontSize: 11, fill: "var(--color-muted)" };

function ProgressContent() {
  const [rangeDays, setRangeDays] = useState(7);
  const hydrationLogs = useWellnessStore((s) => s.hydrationLogs);
  const workoutLogs = useWellnessStore((s) => s.workoutLogs);
  const mindfulnessLogs = useWellnessStore((s) => s.mindfulnessLogs);
  const gratitudeEntries = useWellnessStore((s) => s.gratitudeEntries);

  const series = buildDailySeries(rangeDays, { hydrationLogs, workoutLogs, mindfulnessLogs, gratitudeEntries });
  const journalDaysHit = series.filter((p) => p.journalDone).length;
  const totalWorkoutMin = series.reduce((sum, p) => sum + p.workoutMin, 0);
  const totalMindfulMin = series.reduce((sum, p) => sum + p.mindfulnessMin, 0);
  const avgHydrationMl = Math.round(series.reduce((sum, p) => sum + p.hydrationMl, 0) / series.length);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl text-foreground">Progress</h1>
          <p className="text-sm text-muted">Your wellness trends at a glance.</p>
        </div>
        <div className="flex gap-1 rounded-pill border border-border p-1">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d)}
              className={`rounded-pill px-3 py-1 text-xs transition ${
                rangeDays === d ? "bg-primary text-primary-foreground" : "text-muted"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="text-center"><p className="text-xs text-muted">Avg hydration</p><p className="font-heading text-lg text-foreground">{avgHydrationMl}ml</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">Workout minutes</p><p className="font-heading text-lg text-foreground">{totalWorkoutMin}</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">Journal days</p><p className="font-heading text-lg text-foreground">{journalDaysHit}/{rangeDays}</p></Card>
        <Card className="text-center"><p className="text-xs text-muted">Mindful minutes</p><p className="font-heading text-lg text-foreground">{totalMindfulMin}</p></Card>
      </div>

      <Card>
        <h2 className="mb-3 font-heading text-base text-foreground">Hydration (ml/day)</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis hide />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="hydrationMl" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-heading text-base text-foreground">Workout Minutes</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis hide />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="workoutMin" radius={[6, 6, 0, 0]} fill="var(--color-accent)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-heading text-base text-foreground">Mindfulness Minutes</h2>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={series}>
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
              <YAxis hide />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="mindfulnessMin" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <MiniStreaksWidget />
      <PrivacyControls />
    </div>
  );
}

export default function ProgressPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <ProgressContent />
    </ClientOnly>
  );
}
