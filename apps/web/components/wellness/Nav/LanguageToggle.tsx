"use client";

import { useWellnessStore } from "@/lib/store";

// English is the app's primary language; Arabic is the only secondary
// language offered (no Urdu, and the two scripts are never mixed within a
// single string — each locale's content is authored separately).
export function LanguageToggle() {
  const locale = useWellnessStore((s) => s.locale);
  const setLocale = useWellnessStore((s) => s.setLocale);

  return (
    <div className="flex overflow-hidden rounded-pill border border-border text-xs">
      <button
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-2.5 py-1.5 transition ${locale === "en" ? "bg-primary text-primary-foreground" : "text-muted"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("ar")}
        aria-pressed={locale === "ar"}
        className={`px-2.5 py-1.5 transition ${locale === "ar" ? "bg-primary text-primary-foreground" : "text-muted"}`}
      >
        AR
      </button>
    </div>
  );
}
