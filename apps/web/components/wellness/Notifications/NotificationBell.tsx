"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useWellnessStore } from "@/lib/store";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const notifications = useWellnessStore((s) => s.notifications);
  const markAllRead = useWellnessStore((s) => s.markAllNotificationsRead);
  const markRead = useWellnessStore((s) => s.markNotificationRead);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => {
          setOpen((v) => !v);
          if (!open && unreadCount > 0) markAllRead();
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition hover:bg-primary/10"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 max-w-[90vw] rounded-card border border-border bg-surface p-2 shadow-soft">
          <div className="flex items-center justify-between px-2 py-1">
            <p className="text-sm font-medium text-foreground">Notifications</p>
            <button onClick={() => setOpen(false)} className="text-xs text-muted hover:text-foreground">
              Close
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">No notifications yet</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className="block w-full rounded-lg px-2 py-2 text-left transition hover:bg-primary/5"
                >
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted">{n.body}</p>
                  <p className="mt-0.5 text-[11px] text-muted/70">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
