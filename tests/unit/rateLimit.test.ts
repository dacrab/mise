import { checkRateLimit, LIMITS } from "convex/rateLimit";
import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";

describe("rate limit config", () => {
  it("has correct limits for each action", () => {
    expect(LIMITS["recipe:create"]?.max).toBe(10);
    expect(LIMITS["recipe:update"]?.max).toBe(30);
    expect(LIMITS["bookmark:toggle"]?.max).toBe(60);
  });

  it("uses 1-hour windows with positive limits", () => {
    expect(Object.keys(LIMITS).length).toBeGreaterThan(0);
    for (const config of Object.values(LIMITS)) {
      expect(config.windowMs).toBe(3_600_000);
      expect(config.max).toBeGreaterThan(0);
    }
  });

  it("does not configure signup rate limiting", () => {
    expect(LIMITS["signup"]).toBeUndefined();
  });
});

function makeCtx(recentCount: number) {
  const collect = vi.fn().mockResolvedValue(Array.from({ length: recentCount }, () => ({ _id: "x" }) as const));
  const insert = vi.fn().mockResolvedValue("new-id");
  const db = {
    query: vi.fn(() => ({
      withIndex: vi.fn(() => ({
        filter: vi.fn(() => ({ collect })),
      })),
    })),
    insert,
  };
  return { ctx: { db } as never, collect, insert };
}

describe("checkRateLimit", () => {
  it("returns without querying db for unconfigured actions", async () => {
    const { ctx, collect, insert } = makeCtx(0);
    const result = await checkRateLimit(ctx, "user-id" as never, "signup");
    expect(result).toBeUndefined();
    expect(collect).not.toHaveBeenCalled();
    expect(insert).not.toHaveBeenCalled();
  });

  it("inserts a record when under the limit", async () => {
    const { ctx, insert } = makeCtx(0);
    await checkRateLimit(ctx, "user-id" as never, "recipe:create");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith("rateLimits", {
      userId: "user-id",
      action: "recipe:create",
    });
  });

  it("throws a ConvexError when the limit is reached", async () => {
    const limit = LIMITS["recipe:create"];
    if (!limit) throw new Error("recipe:create rate limit is not configured");
    const { ctx, insert } = makeCtx(limit.max);
    await expect(checkRateLimit(ctx, "user-id" as never, "recipe:create")).rejects.toThrow(ConvexError);
    expect(insert).not.toHaveBeenCalled();
  });

  it("only counts records within the time window", async () => {
    const collect = vi.fn().mockResolvedValueOnce([]);
    const insert = vi.fn().mockResolvedValue("new-id");
    const db = {
      query: vi.fn(() => ({
        withIndex: vi.fn(() => ({
          filter: vi.fn(() => ({ collect })),
        })),
      })),
      insert,
    };
    await checkRateLimit({ db } as never, "user-id" as never, "recipe:update");
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
