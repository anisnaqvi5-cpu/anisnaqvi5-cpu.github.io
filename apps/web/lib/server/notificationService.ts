import crypto from "node:crypto";
import type { NotificationBroadcast } from "@/lib/ecommerce/types";
import { readDb, withDb } from "@/lib/server/db";
import { listCustomers } from "@/lib/server/customerService";

// No push infrastructure exists yet (see WELLNESS_FEATURES.md — the wellness
// app's reminders are client-side/local). This is an honest stand-in: it
// logs what the Content Manager composed and estimates reach from real
// customer counts, rather than pretending to actually deliver a push.
export function listBroadcasts(): NotificationBroadcast[] {
  return readDb((db) => [...db.notificationBroadcasts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function createBroadcast(input: { title: string; body: string; audience: NotificationBroadcast["audience"]; sentBy: string }): Promise<NotificationBroadcast> {
  const customers = listCustomers();
  const recipientCountEstimate = input.audience === "all_customers" ? customers.length : customers.filter((c) => c.isReturning).length;

  return withDb((db) => {
    const broadcast: NotificationBroadcast = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString(), recipientCountEstimate };
    db.notificationBroadcasts.push(broadcast);
    return broadcast;
  });
}
