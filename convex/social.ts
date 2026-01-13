import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Toggle like - validates recipe exists and is published
export const toggleLike = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate recipe exists and is published
    const recipe = await ctx.db.get(recipeId);
    if (!recipe || recipe.status !== "published") {
      throw new Error("Recipe not found");
    }

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { liked: false };
    }

    await ctx.db.insert("likes", { recipeId, userId });

    // Notify recipe owner
    if (recipe.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: recipe.userId,
        type: "like",
        actorId: userId,
        recipeId,
        read: false,
      });
    }

    return { liked: true };
  },
});

// Toggle bookmark - validates recipe exists and is published
export const toggleBookmark = mutation({
  args: { recipeId: v.id("recipes"), collectionId: v.optional(v.id("collections")) },
  handler: async (ctx, { recipeId, collectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    // Validate recipe exists and is published
    const recipe = await ctx.db.get(recipeId);
    if (!recipe || recipe.status !== "published") {
      throw new Error("Recipe not found");
    }

    // Validate collection ownership if provided
    if (collectionId) {
      const collection = await ctx.db.get(collectionId);
      if (!collection || collection.userId !== userId) {
        throw new Error("Collection not found");
      }
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

// Add comment - validates recipe exists and is published
export const addComment = mutation({
  args: {
    recipeId: v.id("recipes"),
    content: v.string(),
  },
  handler: async (ctx, { recipeId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 500) {
      throw new Error("Comment must be 1-500 characters");
    }

    // Validate recipe exists and is published
    const recipe = await ctx.db.get(recipeId);
    if (!recipe || recipe.status !== "published") {
      throw new Error("Recipe not found");
    }

    const id = await ctx.db.insert("comments", { recipeId, userId, content: trimmed });

    // Notify recipe owner
    if (recipe.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: recipe.userId,
        type: "comment",
        actorId: userId,
        recipeId,
        read: false,
      });
    }

    return { id };
  },
});
