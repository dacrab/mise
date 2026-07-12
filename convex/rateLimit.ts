import { ConvexError } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "recipe:create": { max: 10, windowMs: 60 * 60 * 1000 }, // 10/hour
  "recipe:update": { max: 30, windowMs: 60 * 60 * 1000 }, // 30/hour
  "bookmark:toggle": { max: 60, windowMs: 60 * 60 * 1000 }, // 60/hour
};

export async function checkRateLimit(ctx: MutationCtx, userId: Id<"users">, action: string) {
  const limit = LIMITS[action];
  if (!limit) return;

  const windowStart = Date.now() - limit.windowMs;
  const recent = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_action", (q) => q.eq("userId", userId).eq("action", action))
    .filter((q) => q.gte(q.field("_creationTime"), windowStart))
    .collect();

  if (recent.length >= limit.max) {
    throw new ConvexError(`Rate limit exceeded for ${action}. Try again later.`);
  }

  await ctx.db.insert("rateLimits", { userId, action });
}
