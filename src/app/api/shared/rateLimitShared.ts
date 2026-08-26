import type { NextRequest } from "next/server";

type RateLimitRecord = {
  count: number;
  resetTime: number;
};

const store = new Map<string, RateLimitRecord>();
const PRUNE_INTERVAL_MS = 60 * 1000;
const MAX_ENTRIES = 10000;

function pruneExpiredEntries(): void {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetTime) {
      store.delete(key);
    }
  }

  if (store.size > MAX_ENTRIES) {
    store.clear();
  }
}

setInterval(pruneExpiredEntries, PRUNE_INTERVAL_MS).unref();

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";

  const hops = forwarded.split(",").map((hop) => hop.trim());
  return hops[hops.length - 1] || "unknown";
}

export function checkRateLimit(
  subject: string,
  keyPrefix: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${keyPrefix}:${subject}`;
  const now = Date.now();

  const record = store.get(key);
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    store.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

export function checkRequestRateLimit(
  request: NextRequest,
  keyPrefix: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetTime: number } {
  return checkRateLimit(getClientIp(request), keyPrefix, maxRequests, windowMs);
}
