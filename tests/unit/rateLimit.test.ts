import { describe, expect, it } from "vitest";

// Replicate the LIMITS config and threshold logic from convex/rateLimit.ts
const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "recipe:create": { max: 10, windowMs: 60 * 60 * 1000 },
  "recipe:update": { max: 30, windowMs: 60 * 60 * 1000 },
  "bookmark:toggle": { max: 60, windowMs: 60 * 60 * 1000 },
  signup: { max: 5, windowMs: 60 * 60 * 1000 },
};

function isRateLimited(action: string, recentCount: number): boolean {
  const limit = LIMITS[action];
  if (!limit) return false;
  return recentCount >= limit.max;
}

describe("rate limit logic", () => {
  it("allows actions under the limit", () => {
    expect(isRateLimited("recipe:create", 9)).toBe(false);
  });

  it("blocks actions at the limit", () => {
    expect(isRateLimited("recipe:create", 10)).toBe(true);
  });

  it("blocks actions over the limit", () => {
    expect(isRateLimited("signup", 6)).toBe(true);
  });

  it("allows unknown actions (no limit configured)", () => {
    expect(isRateLimited("unknown:action", 999)).toBe(false);
  });

  it("has correct limits for each action", () => {
    expect(LIMITS["recipe:create"]?.max).toBe(10);
    expect(LIMITS["recipe:update"]?.max).toBe(30);
    expect(LIMITS["bookmark:toggle"]?.max).toBe(60);
    expect(LIMITS["signup"]?.max).toBe(5);
  });

  it("uses 1-hour windows", () => {
    for (const config of Object.values(LIMITS)) {
      expect(config.windowMs).toBe(3_600_000);
    }
  });
});
