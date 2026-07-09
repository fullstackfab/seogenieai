import "server-only";

type Bucket = { count: number; resetAt: number };

const MAX_BUCKETS = 2000;
const buckets = new Map<string, Bucket>();

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // Still oversized after dropping expired entries: evict oldest-inserted.
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value;
    if (oldest === undefined) break;
    buckets.delete(oldest);
  }
}

/**
 * Fixed-window in-memory limiter. Per-instance only (resets on cold start),
 * which is acceptable for abuse-damping on cost-bearing routes; swap for a
 * shared store (e.g. Upstash) if stronger guarantees are needed.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) prune(now);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSeconds: 0 };
}

/** First hop of x-forwarded-for, or a fallback — shared by clientKey and the daily-limit helpers. */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

/** Client key for rate limiting: first hop of x-forwarded-for, or a fallback. */
export function clientKey(request: Request, scope: string): string {
  return `${scope}:${clientIp(request)}`;
}
