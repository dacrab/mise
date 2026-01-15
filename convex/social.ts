import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requirePublishedRecipe, sanitizeInput, validateLength, createNotification } from "./lib/helpers";

// Toggle like
export const toggleLike = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await requireAuth(ctx);
    const recipe = await requirePublishedRecipe(ctx, recipeId);

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", { recipeId, userId });
    await createNotification(ctx, { userId: recipe.userId, type: "like", actorId: userId, recipeId });
    return { liked: true };
  },
});

// Toggle bookmark
export const toggleBookmark = mutation({
  args: { recipeId: v.id("recipes"), collectionId: v.optional(v.id("collections")) },
  handler: async (ctx, { recipeId, collectionId }) => {
    const userId = await requireAuth(ctx);
    await requirePublishedRecipe(ctx, recipeId);

    if (collectionId) {
      const collection = await ctx.db.get(collectionId);
      if (!collection || collection.userId !== userId) throw new Error("Collection not found");
    }

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", { recipeId, userId, collectionId });
    return { bookmarked: true };
  },
});

// Get comments - batch user lookups
export const getComments = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_recipe", (q) => q.eq("recipeId", recipeId))
      .order("desc")
      .collect();

    const userIds = [...new Set(comments.map((c) => c.userId))];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(users.filter(Boolean).map((u) => [u!._id, u]));

    return comments.map((comment) => {
      const user = userMap.get(comment.userId);
      return { ...comment, user: user ? { name: user.name, image: user.image } : null };
    });
  },
});

// Add comment
export const addComment = mutation({
  args: { recipeId: v.id("recipes"), content: v.string() },
  handler: async (ctx, { recipeId, content }) => {
    const userId = await requireAuth(ctx);
    const sanitized = sanitizeInput(validateLength(content, 1, 500, "Comment"));
    const recipe = await requirePublishedRecipe(ctx, recipeId);

    const id = await ctx.db.insert("comments", { recipeId, userId, content: sanitized });
    await createNotification(ctx, { userId: recipe.userId, type: "comment", actorId: userId, recipeId });
    return { id };
  },
});
