import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getOptionalAuth, withCoverUrls } from "./lib/helpers";
import type { Id } from "./_generated/dataModel";

// Get trending recipes (most liked in last 7 days)
export const trending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentLikes = await ctx.db.query("likes").order("desc").collect();
    const filteredLikes = recentLikes.filter((l) => l._creationTime > weekAgo);

    const likeCounts = new Map<string, number>();
    for (const like of filteredLikes) {
      likeCounts.set(like.recipeId, (likeCounts.get(like.recipeId) || 0) + 1);
    }

    const topRecipeIds = [...likeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const recipes = await Promise.all(topRecipeIds.map((id) => ctx.db.get(id as Id<"recipes">)));
    const published = recipes.filter((r): r is NonNullable<typeof r> => r !== null && r.status === "published");
    const withUrls = await withCoverUrls(ctx, published);

    return withUrls.map((recipe) => ({
      ...recipe,
      trendingScore: likeCounts.get(recipe._id) || 0,
    }));
  },
});

// Record a view
export const recordView = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    await ctx.db.insert("recipeViews", { recipeId, timestamp: Date.now() });
  },
});

// Get recommendations
export const recommendations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const userId = await getOptionalAuth(ctx);

    if (!userId) {
      const recipes = await ctx.db.query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published")).order("desc").take(limit);
      return withCoverUrls(ctx, recipes);
    }

    const userLikes = await ctx.db.query("likes")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId)).collect();
    const likedRecipeIds = new Set(userLikes.map((l) => l.recipeId));

    if (likedRecipeIds.size === 0) {
      const recipes = await ctx.db.query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published")).order("desc").take(limit);
      return withCoverUrls(ctx, recipes);
    }

    const likedRecipes = await Promise.all([...likedRecipeIds].slice(0, 10).map((id) => ctx.db.get(id)));
    const categories = [...new Set(likedRecipes.filter(Boolean).map((r) => r!.category))];

    const recommendations = [];
    for (const category of categories) {
      const categoryRecipes = await ctx.db.query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published")).order("desc").take(20);

      for (const recipe of categoryRecipes) {
        if (!likedRecipeIds.has(recipe._id) && recipe.userId !== userId) {
          recommendations.push(recipe);
        }
      }
    }

    const unique = [...new Map(recommendations.map((r) => [r._id, r])).values()].slice(0, limit);
    return withCoverUrls(ctx, unique);
  },
});

// Advanced search
export const search = query({
  args: {
    query: v.optional(v.string()), category: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    maxTime: v.optional(v.number()), ingredient: v.optional(v.string()), limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, category, difficulty, maxTime, ingredient, limit = 20 }) => {
    let recipes;

    if (searchQuery) {
      recipes = await ctx.db.query("recipes")
        .withSearchIndex("search_title", (q) => {
          let search = q.search("title", searchQuery);
          if (category) search = search.eq("category", category);
          return search.eq("status", "published");
        }).take(100);
    } else if (category) {
      recipes = await ctx.db.query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published")).order("desc").take(100);
    } else {
      recipes = await ctx.db.query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published")).order("desc").take(100);
    }

    let filtered = recipes;
    if (difficulty) filtered = filtered.filter((r) => r.difficulty === difficulty);
    if (maxTime) filtered = filtered.filter((r) => {
      const total = (r.prepTime || 0) + (r.cookTime || 0);
      return total > 0 && total <= maxTime;
    });
    if (ingredient) {
      const lower = ingredient.toLowerCase();
      filtered = filtered.filter((r) => r.ingredients.some((i) => i.toLowerCase().includes(lower)));
    }

    return withCoverUrls(ctx, filtered.slice(0, limit));
  },
});
