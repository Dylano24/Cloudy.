// Small fixed-window limiter for the dashboard routes. It is per server
// instance (Vercel may run several), so it bounds bursts from one browser; the
// Cloudy Dashboard API applies its own global limit for every write.
type Bucket = { start: number; count: number };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5_000;

export const LIMITS = {
  auth: { limit: 12, windowMs: 60_000 },
  read: { limit: 120, windowMs: 60_000 },
  write: { limit: 20, windowMs: 60_000 },
} as const;

export function takeToken(key: string, { limit, windowMs }: { limit: number; windowMs: number }, now = Date.now()) {
  const bucket = buckets.get(key);
  if (!bucket || now - bucket.start >= windowMs) {
    buckets.delete(key);
    buckets.set(key, { start: now, count: 1 });
    while (buckets.size > MAX_KEYS) buckets.delete(buckets.keys().next().value as string);
    return { ok: true, retryAfter: 0 };
  }
  if (bucket.count >= limit) return { ok: false, retryAfter: Math.ceil((bucket.start + windowMs - now) / 1000) };
  bucket.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function resetRateLimits() {
  buckets.clear();
}
