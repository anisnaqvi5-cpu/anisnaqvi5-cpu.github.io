"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";
import { Card } from "@/components/wellness/ui/Card";
import { ProgressRing } from "@/components/wellness/ui/ProgressRing";
import { useWellnessStore } from "@/lib/store";
import type { MindfulnessSession } from "@/lib/types";

function breathPhaseAt(elapsedSec: number, pattern: NonNullable<MindfulnessSession["breathingPattern"]>) {
  const { inhale, hold, exhale, holdAfter = 0 } = pattern;
  const cycleLen = inhale + hold + exhale + holdAfter || 1;
  const t = elapsedSec % cycleLen;

  if (t < inhale) return { label: "Breathe in", scale: 0.8 + 0.5 * (t / inhale) };
  if (t < inhale + hold) return { label: "Hold", scale: 1.3 };
  if (t < inhale + hold + exhale) {
    const localT = t - inhale - hold;
    return { label: "Breathe out", scale: 1.3 - 0.5 * (localT / exhale) };
  }
  return { label: "Hold", scale: 0.8 };
}

export function BreathingPlayer({ session, onExit }: { session: MindfulnessSession; onExit: () => void }) {
  const logSession = useWellnessStore((s) => s.logMindfulnessSession);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const loggedRef = useRef(false);

  useEffect(() => {
    if (!running || done) return;
    const id = window.setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= session.durationSec) {
          window.clearInterval(id);
          setDone(true);
          setRunning(false);
          return session.durationSec;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, done, session.durationSec]);

  useEffect(() => {
    if (done && !loggedRef.current) {
      loggedRef.current = true;
      logSession(session.id, elapsed, true);
    }
  }, [done, elapsed, logSession, session.id]);

  function handleEndEarly() {
    if (!loggedRef.current) {
      loggedRef.current = true;
      logSession(session.id, elapsed, false);
    }
    onExit();
  }

  const percent = Math.round((elapsed / session.durationSec) * 100);
  const remaining = session.durationSec - elapsed;
  const breath = session.breathingPattern ? breathPhaseAt(elapsed, session.breathingPattern) : null;

  return (
    <Card className="flex flex-col items-center gap-6 text-center">
      <div className="flex w-full items-center justify-between">
        <p className="font-heading text-lg text-foreground">{session.title}</p>
        <button onClick={handleEndEarly} aria-label="Close" className="text-muted hover:text-foreground">
          <X size={18} />
        </button>
      </div>

      {breath ? (
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div
            className="absolute inset-0 m-auto h-40 w-40 rounded-full bg-primary/30 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${breath.scale})` }}
          />
          <div className="relative flex flex-col items-center">
            <p className="font-heading text-xl text-foreground">{breath.label}</p>
            <p className="text-sm text-muted">{remaining}s left</p>
          </div>
        </div>
      ) : (
        <ProgressRing percent={percent} size={200} strokeWidth={14}>
          <div>
            <p className="font-heading text-2xl text-foreground">{Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}</p>
            <p className="text-xs text-muted">remaining</p>
          </div>
        </ProgressRing>
      )}

      {done ? (
        <div className="flex flex-col items-center gap-2">
          <p className="font-heading text-lg text-primary">Session complete 🌿</p>
          <button onClick={onExit} className="rounded-pill bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">
            Done
          </button>
        </div>
      ) : (
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label={running ? "Pause" : "Play"}
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
        </button>
      )}
    </Card>
  );
}
