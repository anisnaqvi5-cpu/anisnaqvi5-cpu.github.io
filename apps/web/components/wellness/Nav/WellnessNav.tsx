"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Droplets, Dumbbell, Home, LineChart, NotebookPen, Wind } from "lucide-react";
import { NotificationBell } from "@/components/wellness/Notifications/NotificationBell";

const NAV_ITEMS = [
  { href: "/wellness", label: "Dashboard", icon: Home },
  { href: "/wellness/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/wellness/hydration", label: "Hydration", icon: Droplets },
  { href: "/wellness/journal", label: "Journal", icon: NotebookPen },
  { href: "/wellness/mindfulness", label: "Mindful", icon: Wind },
  { href: "/wellness/progress", label: "Progress", icon: LineChart },
];

export function WellnessNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur sm:px-6">
        <Link href="/wellness" className="font-heading text-lg text-foreground">
          Wellness
        </Link>
        <NotificationBell />
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-surface/95 px-1 py-1.5 backdrop-blur sm:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] transition ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <nav className="fixed left-0 top-[57px] bottom-0 z-20 hidden w-56 flex-col gap-1 border-r border-border bg-surface/60 p-3 sm:flex">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-primary/10 font-medium text-primary" : "text-muted hover:bg-primary/5 hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
