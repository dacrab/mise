import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getOptionalAuth, withCoverUrls, createNotification } from "./lib/helpers";

// Toggle follow
export const toggle = mutation({
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

// Check if following
export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const userId = await getOptionalAuth(ctx);
    if (!userId) return false;
    const existing = await ctx.db
      .query("follows")
      .withIndex("by_pair", (q) => q.eq("followerId", userId).eq("followingId", targetId))
      .first();
    return !!existing;
  },
});

// Get follower/following counts
export const counts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const [followers, following] = await Promise.all([
      ctx.db.query("follows").withIndex("by_following", (q) => q.eq("followingId", userId)).collect(),
      ctx.db.query("follows").withIndex("by_follower", (q) => q.eq("followerId", userId)).collect(),
    ]);
    return { followers: followers.length, following: following.length };
  },
});

// Get feed - optimized
export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const userId = await getOptionalAuth(ctx);
    if (!userId) return [];

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    const followingIds = new Set(following.map((f) => f.followingId));
    if (followingIds.size === 0) return [];

    const allRecipes = await ctx.db
      .query("recipes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(limit * 5);

    const recipes = allRecipes.filter((r) => followingIds.has(r.userId)).slice(0, limit);

    // Batch fetch authors
    const authorIds = [...new Set(recipes.map((r) => r.userId))];
    const authors = await Promise.all(authorIds.map((id) => ctx.db.get(id)));
    const authorMap = new Map(authors.filter(Boolean).map((a) => [a!._id, a]));

    const withUrls = await withCoverUrls(ctx, recipes);
    return withUrls.map((recipe) => {
      const author = authorMap.get(recipe.userId);
      return { ...recipe, author: author ? { name: author.name, username: author.username, image: author.image } : null };
    });
  },
});
