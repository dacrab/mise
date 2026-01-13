import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Toggle like
export const toggleLike = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_recipe", (q) =>
        q.eq("userId", userId).eq("recipeId", recipeId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", { recipeId, userId });
    return { liked: true };
  },
});

// Toggle bookmark
export const toggleBookmark = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_recipe", (q) =>
        q.eq("userId", userId).eq("recipeId", recipeId)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", { recipeId, userId });
    return { bookmarked: true };
  },
});

// Get comments for a recipe
export const getComments = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_recipe", (q) => q.eq("recipeId", recipeId))
      .order("desc")
      .collect();

    return Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: user ? { name: user.name, image: user.image } : null,
        };
      })
    );
  },
});

// Add comment
export const addComment = mutation({
  args: {
    recipeId: v.id("recipes"),
    content: v.string(),
  },
  handler: async (ctx, { recipeId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    if (content.length < 1 || content.length > 500) {
      throw new Error("Comment must be 1-500 characters");
    }

    const id = await ctx.db.insert("comments", { recipeId, userId, content });
    return { id };
  },
});
