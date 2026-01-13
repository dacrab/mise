import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Rate a recipe
export const rate = mutation({
  args: {
    recipeId: v.id("recipes"),
    value: v.number(),
  },
  handler: async (ctx, { recipeId, value }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

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

// Get rating stats for a recipe
export const getStats = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_recipe", (q) => q.eq("recipeId", recipeId))
      .collect();

    if (ratings.length === 0) return { average: 0, count: 0, userRating: null };

    const average = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;

    const userId = await getAuthUserId(ctx);
    const userRating = userId
      ? ratings.find((r) => r.userId === userId)?.value ?? null
      : null;

    return { average: Math.round(average * 10) / 10, count: ratings.length, userRating };
  },
});
