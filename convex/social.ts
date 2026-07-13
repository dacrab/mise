import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireUser } from "./lib/auth";
import { requirePublishedRecipe } from "./lib/helpers";
import { checkRateLimit } from "./rateLimit";

export const toggleBookmark = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    const user = await requireUser(ctx);
    await checkRateLimit(ctx, user._id, "bookmark:toggle");
    await requirePublishedRecipe(ctx, recipeId);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_recipe", (q) => q.eq("userId", user._id).eq("recipeId", recipeId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { bookmarked: false };
    }

    await ctx.db.insert("bookmarks", { recipeId, userId: user._id });
    return { bookmarked: true };
  },
});
