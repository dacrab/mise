import type { Id } from "convex/_generated/dataModel";
import type { MutationCtx } from "convex/_generated/server";
import { checkRateLimit, LIMITS } from "convex/rateLimit";
import { ConvexError } from "convex/values";
import { describe, expect, it, vi } from "vitest";

const USER_ID = "user-id" as Id<"users">;

describe("rate limit config", () => {
  it("has correct limits for each action", () => {
    expect(LIMITS["recipe:create"].max).toBe(10);
    expect(LIMITS["recipe:update"].max).toBe(30);
    expect(LIMITS["bookmark:toggle"].max).toBe(60);
  });

  it("uses 1-hour windows with positive limits", () => {
    expect(Object.keys(LIMITS).length).toBeGreaterThan(0);
    for (const config of Object.values(LIMITS)) {
      expect(config.windowMs).toBe(3_600_000);
      expect(config.max).toBeGreaterThan(0);
    }
  });
});

function makeCtx(recent: { _id: string }[], expired: { _id: string }[]) {
  const collect = vi.fn().mockResolvedValueOnce(recent).mockResolvedValue(expired);
  const filter = vi.fn(() => ({ collect }));
  const withIndex = vi.fn(
    (_name: string, _build: (q: { eq: (field: string, value: unknown) => unknown }) => unknown) => ({
      filter,
    }),
  );
  const query = vi.fn(() => ({ withIndex }));
  const insert = vi.fn().mockResolvedValue("new-id");
  const deleteFn = vi.fn().mockResolvedValue(null);
  const db = { query, insert, delete: deleteFn };
  return { ctx: { db } as unknown as MutationCtx, query, withIndex, insert, deleteFn };
}

describe("checkRateLimit", () => {
  it("queries the rateLimits table by the user/action index", async () => {
    const { ctx, query, withIndex } = makeCtx([], []);
    await checkRateLimit(ctx, USER_ID, "recipe:create");
    expect(query).toHaveBeenCalledWith("rateLimits");
    expect(withIndex).toHaveBeenCalledTimes(2);
    for (const [name, build] of withIndex.mock.calls) {
      expect(name).toBe("by_user_action");
      const q = { eq: vi.fn(() => ({ eq: vi.fn() })) };
      build(q);
      expect(q.eq).toHaveBeenCalledWith("userId", "user-id");
    }
  });

  it("inserts a record when under the limit", async () => {
    const { ctx, insert } = makeCtx([], []);
    await checkRateLimit(ctx, USER_ID, "recipe:create");
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith("rateLimits", {
      userId: "user-id",
      action: "recipe:create",
    });
  });

  it("throws a ConvexError when the limit is reached", async () => {
    const { ctx, insert } = makeCtx(
      Array.from({ length: LIMITS["recipe:create"].max }, () => ({ _id: "recent" })),
      [],
    );
    await expect(checkRateLimit(ctx, USER_ID, "recipe:create")).rejects.toThrow(ConvexError);
    expect(insert).not.toHaveBeenCalled();
  });

  it("deletes expired records and does not count them toward the limit", async () => {
    const { ctx, deleteFn, insert } = makeCtx([], [{ _id: "expired" }]);
    await checkRateLimit(ctx, USER_ID, "recipe:update");
    expect(deleteFn).toHaveBeenCalledWith("expired");
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("allows records exactly at the limit minus one", async () => {
    const { ctx, insert } = makeCtx(
      Array.from({ length: LIMITS["recipe:create"].max - 1 }, () => ({ _id: "recent" })),
      [],
    );
    await checkRateLimit(ctx, USER_ID, "recipe:create");
    expect(insert).toHaveBeenCalledTimes(1);
  });
});
