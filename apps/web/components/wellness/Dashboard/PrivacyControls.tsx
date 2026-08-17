"use client";

import { useState } from "react";
import { Card } from "@/components/wellness/ui/Card";
import { useWellnessStore } from "@/lib/store";

export function PrivacyControls() {
  const exportAllData = useWellnessStore((s) => s.exportAllData);
  const clearAllWellnessData = useWellnessStore((s) => s.clearAllWellnessData);
  const [confirming, setConfirming] = useState(false);

  function handleExport() {
    const json = exportAllData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wellness-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearAllWellnessData();
    setConfirming(false);
  }

  return (
    <Card>
      <h2 className="mb-1 font-heading text-base text-foreground">Privacy & Data</h2>
      <p className="mb-3 text-xs text-muted">
        Your wellness data stays on this device only. You can export or permanently delete it at any time.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleExport}
          className="flex-1 rounded-pill border border-border px-3 py-2 text-sm text-foreground hover:bg-primary/5"
        >
          Export My Data
        </button>
        <button
          onClick={handleClear}
          className={`flex-1 rounded-pill border px-3 py-2 text-sm transition ${
            confirming ? "border-danger bg-danger/10 text-danger" : "border-border text-muted hover:bg-danger/5 hover:text-danger"
          }`}
        >
          {confirming ? "Confirm Delete All" : "Delete All Data"}
        </button>
      </div>
    </Card>
  );
}
