import fs from "node:fs";
import path from "node:path";
import type {
  OrderRecord,
  OrderItemRecord,
  PaymentRecord,
  ReturnRequest,
  Review,
} from "@/lib/ecommerce/types";

// Server-side order/payment store. Orders and payments are financial /
// security-critical records — unlike the wellness modules (intentionally
// browser-local, see WELLNESS_FEATURES.md), these MUST be server-authoritative
// so a Stripe webhook (which has no browser to talk to) can update them.
//
// This uses a JSON file instead of Postgres/Supabase to keep the demo free of
// external infrastructure/billing setup (same rationale as the wellness
// store's local-first choice) while still being genuinely server-side code a
// webhook can reach. DATABASE_SCHEMA.md's `orders`/`payments`/etc. tables are
// the production target — swapping this module's internals for real SQL
// queries is a drop-in change; nothing that calls into `db` needs to change.

interface DbShape {
  orders: OrderRecord[];
  orderItems: OrderItemRecord[];
  payments: PaymentRecord[];
  processedWebhookEventIds: string[];
  returnRequests: ReturnRequest[];
  reviews: Review[];
}

const DB_PATH = path.join(process.cwd(), ".data", "db.json");

function emptyDb(): DbShape {
  return { orders: [], orderItems: [], payments: [], processedWebhookEventIds: [], returnRequests: [], reviews: [] };
}

function load(): DbShape {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return { ...emptyDb(), ...JSON.parse(raw) };
  } catch {
    return emptyDb();
  }
}

let cache: DbShape | null = null;

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), "utf-8");
}

// A single in-process write queue keeps concurrent API-route calls from
// interleaving read-modify-write cycles on the JSON file.
let writeQueue: Promise<unknown> = Promise.resolve();

export function withDb<T>(fn: (db: DbShape) => T): Promise<T> {
  const run = writeQueue.then(() => {
    if (!cache) cache = load();
    const result = fn(cache);
    save();
    return result;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export function readDb<T>(fn: (db: DbShape) => T): T {
  if (!cache) cache = load();
  return fn(cache);
}
