import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { getAuthUserId } from "./lib/auth";
import { withCoverUrls } from "./lib/storage";

export const trending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const recentLikes = await ctx.db
      .query("likes")
      .filter((q) => q.gt(q.field("_creationTime"), weekAgo))
      .take(1000);

    const likeCounts = new Map<string, number>();
    for (const like of recentLikes) {
      likeCounts.set(like.recipeId, (likeCounts.get(like.recipeId) ?? 0) + 1);
    }

    const topRecipeIds = [...likeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topRecipeIds.length === 0) return [];

    const recipes = await Promise.all(topRecipeIds.map((id) => ctx.db.get(id as Id<"recipes">)));
    const published = recipes.filter((r): r is NonNullable<typeof r> => r !== null && r.status === "published");
    const withUrls = await withCoverUrls(ctx, published);

    return withUrls.map((recipe) => ({
      ...recipe,
      trendingScore: likeCounts.get(recipe._id) ?? 0,
    }));
  },
});

export const recommendations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const userId = await getAuthUserId(ctx);

    const latestPublished = () =>
      ctx.db.query("recipes").withIndex("by_status", (q) => q.eq("status", "published")).order("desc").take(limit);

    if (!userId) return withCoverUrls(ctx, await latestPublished());

    const userLikes = await ctx.db
      .query("likes")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId))
      .collect();
    const likedRecipeIds = new Set(userLikes.map((l) => l.recipeId));

    if (likedRecipeIds.size === 0) return withCoverUrls(ctx, await latestPublished());

    const likedRecipes = await Promise.all([...likedRecipeIds].slice(0, 10).map((id) => ctx.db.get(id)));
    const categories = [...new Set(likedRecipes.flatMap((r) => (r ? [r.category] : [])))];

    const categoryResults = await Promise.all(
      categories.map((category) =>
        ctx.db
          .query("recipes")
          .withIndex("by_category", (q) => q.eq("category", category))
          .filter((q) => q.eq(q.field("status"), "published"))
          .order("desc")
          .take(20)
      )
    );

    const seen = new Set<string>();
    const recommendations = [];
    for (const categoryRecipes of categoryResults) {
      for (const recipe of categoryRecipes) {
        if (!likedRecipeIds.has(recipe._id) && recipe.userId !== userId && !seen.has(recipe._id)) {
          seen.add(recipe._id);
          recommendations.push(recipe);
        }
      }
    }

    const unique = recommendations.slice(0, limit);
    return withCoverUrls(ctx, unique);
  },
});
