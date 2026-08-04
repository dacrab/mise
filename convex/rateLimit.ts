import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const RATE_LIMIT_ACTIONS = ["recipe:create", "recipe:update", "bookmark:toggle"] as const;

export type RateLimitAction = (typeof RATE_LIMIT_ACTIONS)[number];

export const LIMITS: Record<RateLimitAction, { max: number; windowMs: number }> = {
  "recipe:create": { max: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  "recipe:update": { max: 30, windowMs: 60 * 60 * 1000 }, // 30/hour
  "bookmark:toggle": { max: 60, windowMs: 60 * 60 * 1000 }, // 60/hour
};

export async function checkRateLimit(ctx: MutationCtx, userId: Id<"users">, action: RateLimitAction) {
  const limit = LIMITS[action];
  const windowStart = Date.now() - limit.windowMs;
  const recent = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_action", (q) => q.eq("userId", userId).eq("action", action))
    .filter((q) => q.gte(q.field("_creationTime"), windowStart))
    .collect();

  if (recent.length >= limit.max) {
    throw new ConvexError("Too many requests. Please try again later.");
  }

  const expired = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_action", (q) => q.eq("userId", userId).eq("action", action))
    .filter((q) => q.lt(q.field("_creationTime"), windowStart))
    .collect();
  await Promise.all(expired.map((row) => ctx.db.delete(row._id)));

  await ctx.db.insert("rateLimits", { userId, action });
}
