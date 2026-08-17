"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ClientOnly } from "@/components/wellness/ui/ClientOnly";
import { DashboardSkeleton } from "@/components/wellness/ui/DashboardSkeleton";
import { JournalCalendar } from "@/components/wellness/Journal/JournalCalendar";
import { EntryComposer } from "@/components/wellness/Journal/EntryComposer";

function JournalContent() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl text-foreground">Gratitude Journal</h1>
        <p className="text-sm text-muted">Private entries — just for you.</p>
      </div>
      <JournalCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
      <EntryComposer date={selectedDate} />
    </div>
  );
}

export default function JournalPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <JournalContent />
    </ClientOnly>
  );
}
