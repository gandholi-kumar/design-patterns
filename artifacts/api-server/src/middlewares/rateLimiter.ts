import type { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

/**
 * Sliding-window in-memory rate limiter middleware.
 * Protects compute-heavy endpoints (AI, Code execution) against abuse.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests, please try again later." } = options;
  const hits = new Map<string, { count: number; resetTime: number }>();

  // Periodically evict expired entries to avoid memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, windowMs);
  interval.unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.ip || req.socket.remoteAddress || "anonymous") as string;
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetTime) {
      hits.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message,
        },
      });
    }

    return next();
  };
}
