import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireAuth } from "./lib/auth";
import { requirePublishedRecipe } from "./lib/helpers";
import { checkRateLimit } from "./rateLimit";

export const toggleBookmark = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const userId = await requireAuth(ctx);
    await checkRateLimit(ctx, userId, "bookmark:toggle");
    await requirePublishedRecipe(ctx, recipeId);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipeId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", { recipeId, userId });
    return { bookmarked: true };
  },
});
