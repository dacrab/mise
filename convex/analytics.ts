import { internalMutation } from "./_generated/server";

export const cleanupOldViews = internalMutation({
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    const oldViews = await ctx.db
      .query("recipeViews")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", thirtyDaysAgo))
      .take(500);

    await Promise.all(oldViews.map((v) => ctx.db.delete(v._id)));
  },
});

export const recalculateTrending = internalMutation({
  handler: async (_ctx) => {
    // Trending is calculated on-demand in discovery.ts
  },
});