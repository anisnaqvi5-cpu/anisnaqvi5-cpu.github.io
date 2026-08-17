"use client";

import { WellnessNav } from "@/components/wellness/Nav/WellnessNav";
import { useHydrationReminder } from "@/lib/wellness/useReminders";

export default function WellnessLayout({ children }: { children: React.ReactNode }) {
  useHydrationReminder();

  return (
    <div className="min-h-screen bg-background">
      <WellnessNav />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6 sm:pb-10 sm:pl-64 sm:pr-6">{children}</main>
    </div>
  );
}
