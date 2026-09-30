const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const row = buckets.get(key);
  if (!row || now > row.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return null;
  }
  row.count += 1;
  if (row.count > limit) return "Too many tries. Wait a few minutes and try again.";
  return null;
}
