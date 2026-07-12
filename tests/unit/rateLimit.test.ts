import { LIMITS } from "convex/rateLimit";
import { describe, expect, it } from "vitest";

describe("rate limit config", () => {
  it("has correct limits for each action", () => {
    expect(LIMITS["recipe:create"]?.max).toBe(10);
    expect(LIMITS["recipe:update"]?.max).toBe(30);
    expect(LIMITS["bookmark:toggle"]?.max).toBe(60);
  });

  it("uses 1-hour windows", () => {
    for (const config of Object.values(LIMITS)) {
      expect(config.windowMs).toBe(3_600_000);
    }
  });

  it("does not configure signup rate limiting", () => {
    expect(LIMITS["signup"]).toBeUndefined();
  });
});
