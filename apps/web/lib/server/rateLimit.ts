import { NextResponse } from "next/server";

// In-memory fixed-window rate limiter — consistent with lib/server/db.ts's
// single-process JSON-store architecture (see PRODUCTION_READINESS.md
// "Rate limiting"). Correct for one server instance; a multi-instance
// deployment needs a shared store (Redis/Upstash) instead — swapping
// checkRateLimit's internals for that is a drop-in change, callers don't
// need to change.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic sweep so long-lived buckets for one-off callers don't accumulate
// forever in memory.
const sweeper = setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  },
  5 * 60_000
);
sweeper.unref?.();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, retryAfterSec: 0 };
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Drop-in guard for the top of a route handler:
 *   const limited = rateLimitOrNull(req, { key: "checkout", limit: 10, windowMs: 60_000 });
 *   if (limited) return limited;
 */
export function rateLimitOrNull(req: Request, opts: { key: string; limit: number; windowMs: number }): NextResponse | null {
  const ip = getClientIp(req);
  const result = checkRateLimit(`${opts.key}:${ip}`, opts.limit, opts.windowMs);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSec) } }
    );
  }
  return null;
}
