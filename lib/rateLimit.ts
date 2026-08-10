import { NextRequest } from "next/server";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const failedAttemptsMap = new Map<string, RateLimitRecord>();

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

export function checkRateLimit(
  ip: string,
  maxAttempts: number = 5,
  windowMs: number = 5 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip);

  if (!record || now > record.resetAt) {
    return { allowed: true, remaining: maxAttempts, retryAfterSec: 0 };
  }

  if (record.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    retryAfterSec: 0,
  };
}

export function recordFailedAttempt(
  ip: string,
  windowMs: number = 5 * 60 * 1000
): void {
  const now = Date.now();
  const record = failedAttemptsMap.get(ip);

  if (!record || now > record.resetAt) {
    failedAttemptsMap.set(ip, {
      count: 1,
      resetAt: now + windowMs,
    });
  } else {
    record.count += 1;
  }
}

export function resetFailedAttempts(ip: string): void {
  failedAttemptsMap.delete(ip);
}
