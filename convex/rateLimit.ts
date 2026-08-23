import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

const RATE_LIMIT_ACTIONS = ["recipe:create", "recipe:update", "bookmark:toggle"] as const;

export type RateLimitAction = (typeof RATE_LIMIT_ACTIONS)[number];

export const LIMITS: Record<RateLimitAction, { max: number; windowMs: number }> = {
  "recipe:create": { max: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  "recipe:update": { max: 120, windowMs: 60 * 60 * 1000 }, // 120/hour (autosave-friendly)
  "bookmark:toggle": { max: 60, windowMs: 60 * 60 * 1000 }, // 60/hour
};

export async function checkRateLimit(ctx: MutationCtx, userId: Id<"users">, action: RateLimitAction) {
  const limit = LIMITS[action];
  const windowStart = Date.now() - limit.windowMs;
  const rows = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_action", (q) => q.eq("userId", userId).eq("action", action))
    .collect();

  if (rows.filter((row) => row._creationTime >= windowStart).length >= limit.max) {
    throw new ConvexError("Too many requests. Please try again later.");
  }

  await Promise.all(rows.filter((row) => row._creationTime < windowStart).map((row) => ctx.db.delete(row._id)));

  await ctx.db.insert("rateLimits", { userId, action });
}
