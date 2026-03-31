import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./lib/auth";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);

    // Batch fetch actors and recipes
    const actorIds = [...new Set(notifications.map((n) => n.actorId))];
    const recipeIds = [...new Set(notifications.flatMap((n) => (n.recipeId ? [n.recipeId] : [])))];

    const [actors, recipes] = await Promise.all([
      Promise.all(actorIds.map((id) => ctx.db.get(id))),
      Promise.all(recipeIds.map((id) => ctx.db.get(id))),
    ]);

    const actorMap = new Map(actors.flatMap((a) => (a ? [[a._id, a] as const] : [])));
    const recipeMap = new Map(recipes.flatMap((r) => (r ? [[r._id, r] as const] : [])));

    return notifications.map((n) => {
      const actor = actorMap.get(n.actorId);
      const recipe = n.recipeId ? recipeMap.get(n.recipeId) : null;
      return {
        ...n,
        actor: actor ? { name: actor.name, image: actor.image, username: actor.username } : null,
        recipe: recipe ? { title: recipe.title, slug: recipe.slug } : null,
      };
    });
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .collect();
    return unread.length;
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .collect();
    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const notification = await ctx.db.get(id);
    if (notification?.userId === userId) {
      await ctx.db.patch(id, { read: true });
    }
  },
});
