import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  AdminSessionRecord,
  AdminUserRecord,
  AuditLogEntry,
  Category,
  Coupon,
  FontRecord,
  NotificationBroadcast,
  OrderRecord,
  OrderItemRecord,
  PaymentRecord,
  Product,
  QuoteRecord,
  Review,
  ReturnRequest,
} from "@/lib/ecommerce/types";
import type { GratitudeEntry, MindfulnessSession, Workout } from "@/lib/types";
import { CATEGORIES, COUPONS, PRODUCTS } from "@/lib/ecommerce/catalog";
import { GRATITUDE_PROMPTS, GRATITUDE_PROMPTS_AR, MINDFULNESS_CATALOG, WORKOUT_CATALOG } from "@/lib/wellness/seedData";
import { hashPassword } from "@/lib/server/passwordHash";

// Server-side store for everything the Admin Dashboard manages, plus orders
// and payments. See ECOMMERCE_SYSTEM.md §1 for why this is a real server-side
// module (JSON-file-backed instead of Postgres, for zero external
// infrastructure) rather than the browser-local pattern the wellness/shop
// client state uses — anything here is either money, or admin-authoritative
// content that must be the same for every visitor, not per-browser.

export interface GratitudePromptRecord {
  id: string;
  text: string;
  textAr: string;
  isActive: boolean;
}

interface DbShape {
  // Commerce (existing)
  orders: OrderRecord[];
  orderItems: OrderItemRecord[];
  payments: PaymentRecord[];
  processedWebhookEventIds: string[];
  returnRequests: ReturnRequest[];
  reviews: Review[];

  // Catalog (admin-managed)
  products: Product[];
  categories: Category[];
  coupons: Coupon[];

  // Customization library
  fonts: FontRecord[];
  quotes: QuoteRecord[];

  // Wellness content (admin-managed source of truth; the wellness app fetches
  // this live — see /api/wellness/content — falling back to its bundled
  // seed data if the fetch hasn't resolved yet)
  workouts: Workout[];
  mindfulnessSessions: MindfulnessSession[];
  gratitudePrompts: GratitudePromptRecord[];

  // Admin / RBAC / security
  adminUsers: AdminUserRecord[];
  adminSessions: AdminSessionRecord[];
  auditLogs: AuditLogEntry[];
  notificationBroadcasts: NotificationBroadcast[];
}

const DB_PATH = path.join(process.cwd(), ".data", "db.json");
const SEED_VERSION = 2; // bump to force reseed after a shape change

function seedAdminUsers(): AdminUserRecord[] {
  const now = new Date().toISOString();
  const demo = (email: string, name: string, role: AdminUserRecord["role"]): AdminUserRecord => ({
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: hashPassword("wellness-admin-demo"),
    role,
    isActive: true,
    createdAt: now,
    lastLoginAt: null,
  });
  return [
    demo("super@wellness.demo", "Sara (Super Admin)", "super_admin"),
    demo("products@wellness.demo", "Imran (Product Manager)", "product_manager"),
    demo("orders@wellness.demo", "Fatima (Order Manager)", "order_manager"),
    demo("content@wellness.demo", "Bilal (Content Manager)", "content_manager"),
  ];
}

function seedFonts(): FontRecord[] {
  return [
    { id: crypto.randomUUID(), name: "Inter", cssFamily: "Inter, sans-serif", isActive: true },
    { id: crypto.randomUUID(), name: "Fraunces", cssFamily: "Fraunces, serif", isActive: true },
    { id: crypto.randomUUID(), name: "Amiri", cssFamily: "Amiri, serif", isActive: true },
  ];
}

function seedQuotes(): QuoteRecord[] {
  return [
    { id: crypto.randomUUID(), text: { en: "Small steps, every day.", ar: "خطوات صغيرة كل يوم." }, category: "motivational", isActive: true },
    { id: crypto.randomUUID(), text: { en: "Breathe. You've got this.", ar: "تنفس. أنت قادر على ذلك." }, category: "motivational", isActive: true },
    { id: crypto.randomUUID(), text: { en: "Progress, not perfection.", ar: "التقدم لا الكمال." }, category: "motivational", isActive: true },
  ];
}

function emptyDb(): DbShape {
  return {
    orders: [],
    orderItems: [],
    payments: [],
    processedWebhookEventIds: [],
    returnRequests: [],
    reviews: [],
    products: PRODUCTS,
    categories: CATEGORIES,
    coupons: COUPONS,
    fonts: seedFonts(),
    quotes: seedQuotes(),
    workouts: WORKOUT_CATALOG,
    mindfulnessSessions: MINDFULNESS_CATALOG,
    gratitudePrompts: GRATITUDE_PROMPTS.map((text, i) => ({
      id: crypto.randomUUID(),
      text,
      textAr: GRATITUDE_PROMPTS_AR[i] ?? "",
      isActive: true,
    })),
    adminUsers: seedAdminUsers(),
    adminSessions: [],
    auditLogs: [],
    notificationBroadcasts: [],
  };
}

function load(): DbShape & { __seedVersion?: number } {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.__seedVersion !== SEED_VERSION) {
      const fresh = emptyDb();
      return { ...fresh, __seedVersion: SEED_VERSION };
    }
    return { ...emptyDb(), ...parsed };
  } catch {
    return { ...emptyDb(), __seedVersion: SEED_VERSION };
  }
}

let cache: (DbShape & { __seedVersion?: number }) | null = null;

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify({ ...cache, __seedVersion: SEED_VERSION }, null, 2), "utf-8");
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
