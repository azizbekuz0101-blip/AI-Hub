interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(identifier: string): { success: boolean; limit: number; remaining: number; resetMs: number } {
  const maxRequests = parseInt(process.env.RATE_LIMIT_REQUESTS || '10', 10);
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
  const now = Date.now();

  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetMs: windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetMs: entry.resetAt - now,
    };
  }

  entry.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - entry.count,
    resetMs: entry.resetAt - now,
  };
}
