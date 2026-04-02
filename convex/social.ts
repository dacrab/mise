import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId, requireAuth } from "./lib/auth";
import { validateLength } from "./lib/validation";
import { createNotification } from "./lib/notifications";
import { requirePublishedRecipe } from "./lib/helpers";

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

    await ctx.db.insert("bookmarks", {
      recipeId,
      userId,
      ...(collectionId !== undefined && { collectionId }),
    });
    return { bookmarked: true };
  },
});

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
    const userMap = new Map(users.flatMap((u) => (u ? [[u._id, u] as const] : [])));

    return comments.map((comment) => {
      const user = userMap.get(comment.userId);
      return { ...comment, user: user ? { name: user.name, image: user.image } : null };
    });
  },
});

export const addComment = mutation({
  args: { recipeId: v.id("recipes"), content: v.string() },
  handler: async (ctx, { recipeId, content }) => {
    const userId = await requireAuth(ctx);
    const sanitized = validateLength(content, 1, 500, "Comment");
    const recipe = await requirePublishedRecipe(ctx, recipeId);

    const id = await ctx.db.insert("comments", { recipeId, userId, content: sanitized });
    await createNotification(ctx, { userId: recipe.userId, type: "comment", actorId: userId, recipeId });
    return { id };
  },
});

export const toggleFollow = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const userId = await requireAuth(ctx);
    if (userId === targetId) throw new Error("Cannot follow yourself");
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", userId).eq("followingId", targetId))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    }
    await ctx.db.insert("follows", { followerId: userId, followingId: targetId });
    await createNotification(ctx, { userId: targetId, type: "follow", actorId: userId });
    return { following: true };
  },
});

export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    return !!(await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", userId).eq("followingId", targetId))
      .first());
  },
});

export const followCounts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [followers, following] = await Promise.all([
      ctx.db
        .query("follows")
        .withIndex("by_following", (q) => q.eq("followingId", userId))
        .collect(),
      ctx.db
        .query("follows")
        .withIndex("by_follower", (q) => q.eq("followerId", userId))
        .collect(),
    ]);
    return { followers: followers.length, following: following.length };
  },
});

export const updateComment = mutation({
  args: { id: v.id("comments"), content: v.string() },
  handler: async (ctx, { id, content }) => {
    const userId = await requireAuth(ctx);
    const comment = await ctx.db.get(id);
    if (!comment || comment.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { content: validateLength(content, 1, 500, "Comment") });
  },
});

export const deleteComment = mutation({
  args: { id: v.id("comments") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const comment = await ctx.db.get(id);
    if (!comment || comment.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(id);
  },
});

export const rateRecipe = mutation({
  args: { recipeId: v.id("recipes"), value: v.number() },
  handler: async (ctx, { recipeId, value }) => {
    const userId = await requireAuth(ctx);
    if (value < 1 || value > 5) throw new Error("Rating must be 1-5");
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("ratings", { recipeId, userId, value });
    }
    return { success: true };
  },
});

export const ratingStats = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await getAuthUserId(ctx);
    const [ratings, userRatingDoc] = await Promise.all([
      ctx.db
        .query("ratings")
        .withIndex("by_recipe", (q) => q.eq("recipeId", recipeId))
        .collect(),
      userId
        ? ctx.db
            .query("ratings")
            .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
            .first()
        : Promise.resolve(null),
    ]);

    if (ratings.length === 0) return { average: 0, count: 0, userRating: null };

    const average = ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length;
    return {
      average: Math.round(average * 10) / 10,
      count: ratings.length,
      userRating: userRatingDoc?.value ?? null,
    };
  },
});
