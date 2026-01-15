import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, getOptionalAuth } from "./lib/helpers";

const PRESENCE_TTL = 30_000; // 30 seconds

// Heartbeat - call every ~10s while on recipe page
export const heartbeat = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await requireAuth(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { lastSeen: now });
    } else {
      await ctx.db.insert("presence", { recipeId, userId, lastSeen: now });
    }
  },
});

// Leave - call when navigating away
export const leave = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await getOptionalAuth(ctx);
    if (!userId) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();

    if (existing) await ctx.db.delete(existing._id);
  },
});

// Get active cooks on a recipe
export const getCooking = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const cutoff = Date.now() - PRESENCE_TTL;
    const presence = await ctx.db
      .query("presence")
      .withIndex("by_recipe", (q) => q.eq("recipeId", recipeId))
      .collect();

    const active = presence.filter((p) => p.lastSeen > cutoff);
    const currentUserId = await getOptionalAuth(ctx);

    const users = await Promise.all(
      active
        .filter((p) => p.userId !== currentUserId) // exclude self
        .slice(0, 5) // max 5
        .map(async (p) => {
          const user = await ctx.db.get(p.userId);
          return user ? { name: user.name, image: user.image } : null;
        })
    );

    return { count: active.length, users: users.filter(Boolean) };
  },
});
