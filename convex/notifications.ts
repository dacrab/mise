import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's notifications
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

    return Promise.all(
      notifications.map(async (n) => {
        const actor = await ctx.db.get(n.actorId);
        const recipe = n.recipeId ? await ctx.db.get(n.recipeId) : null;
        return {
          ...n,
          actor: actor ? { name: actor.name, image: actor.image, username: actor.username } : null,
          recipe: recipe ? { title: recipe.title, slug: recipe.slug } : null,
        };
      })
    );
  },
});

// Get unread count
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

// Mark all as read
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

// Mark single as read
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const notification = await ctx.db.get(id);
    if (!notification || notification.userId !== userId) return;

    await ctx.db.patch(id, { read: true });
  },
});

// Internal: Create notification (called from other mutations)
export const create = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow"), v.literal("fork")),
    actorId: v.id("users"),
    recipeId: v.optional(v.id("recipes")),
  },
  handler: async (ctx, args) => {
    // Don't notify yourself
    if (args.userId === args.actorId) return;

    await ctx.db.insert("notifications", { ...args, read: false });
  },
});
