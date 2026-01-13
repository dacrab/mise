import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Toggle follow
export const toggle = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
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
    
    // Create notification
    await ctx.db.insert("notifications", {
      userId: targetId,
      type: "follow",
      actorId: userId,
      read: false,
    });

    return { following: true };
  },
});

// Check if following
export const isFollowing = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId: targetId }) => {
    const userId = await getAuthUserId(ctx);
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

// Get feed (recipes from followed users)
export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 20 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const following = await ctx.db
      .query("follows")
      .withIndex("by_follower", (q) => q.eq("followerId", userId))
      .collect();

    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    // Get recent recipes from followed users
    const allRecipes = await Promise.all(
      followingIds.map((id) =>
        ctx.db
          .query("recipes")
          .withIndex("by_user", (q) => q.eq("userId", id))
          .filter((q) => q.eq(q.field("status"), "published"))
          .order("desc")
          .take(10)
      )
    );

    const recipes = allRecipes.flat().sort((a, b) => b._creationTime - a._creationTime).slice(0, limit);

    return Promise.all(
      recipes.map(async (recipe) => {
        const author = await ctx.db.get(recipe.userId);
        return {
          ...recipe,
          coverImageUrl: recipe.coverImage ? await ctx.storage.getUrl(recipe.coverImage) : null,
          author: author ? { name: author.name, username: author.username, image: author.image } : null,
        };
      })
    );
  },
});
