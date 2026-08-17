"use client";

import type { DesignElement, PrintZone } from "@/lib/ecommerce/types";

export function PersonalizationPanel({
  zones,
  value,
  onChange,
}: {
  zones: PrintZone[];
  value: DesignElement[];
  onChange: (elements: DesignElement[]) => void;
}) {
  function setZoneValue(zone: PrintZone, val: string) {
    const next = value.filter((e) => e.zoneId !== zone.id);
    next.push({ zoneId: zone.id, type: zone.type, value: val });
    onChange(next);
  }

  function valueFor(zoneId: string): string {
    return value.find((e) => e.zoneId === zoneId)?.value ?? "";
  }

  return (
    <div className="flex flex-col gap-4 rounded-card border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-medium text-foreground">Personalize this product</p>
      {zones.map((zone) => (
        <div key={zone.id}>
          <label className="mb-1 block text-xs text-muted">
            {zone.label}
            {zone.maxChars ? ` (max ${zone.maxChars} chars)` : ""}
          </label>
          {zone.type === "text" ? (
            <input
              value={valueFor(zone.id)}
              maxLength={zone.maxChars}
              onChange={(e) => setZoneValue(zone, e.target.value)}
              placeholder={`Enter ${zone.label.toLowerCase()}`}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          ) : (
            <div className="flex gap-2">
              {zone.colorPalette?.map((hex) => (
                <button
                  key={hex}
                  onClick={() => setZoneValue(zone, hex)}
                  aria-label={hex}
                  className={`h-8 w-8 rounded-full border-2 transition ${valueFor(zone.id) === hex ? "border-foreground scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
