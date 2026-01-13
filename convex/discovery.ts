import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

// Get trending recipes (most liked in last 7 days)
export const trending = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Get recent likes
    const recentLikes = await ctx.db.query("likes").order("desc").collect();
    const filteredLikes = recentLikes.filter((l) => l._creationTime > weekAgo);

    // Count likes per recipe
    const likeCounts = new Map<string, number>();
    for (const like of filteredLikes) {
      const id = like.recipeId;
      likeCounts.set(id, (likeCounts.get(id) || 0) + 1);
    }

    // Sort by count and get top recipes
    const topRecipeIds = [...likeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const recipes = await Promise.all(
      topRecipeIds.map((id) => ctx.db.get(id as Id<"recipes">))
    );

    const published = recipes.filter(
      (r): r is NonNullable<typeof r> => r !== null && r.status === "published"
    );

    return Promise.all(
      published.map(async (recipe) => ({
        ...recipe,
        coverImageUrl: recipe.coverImage ? await ctx.storage.getUrl(recipe.coverImage) : null,
        trendingScore: likeCounts.get(recipe._id) || 0,
      }))
    );
  },
});

// Record a view
export const recordView = mutation({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, { recipeId }) => {
    await ctx.db.insert("recipeViews", { recipeId, timestamp: Date.now() });
  },
});

// Get recommendations based on user's liked recipes
export const recommendations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Return popular recipes for non-logged in users
      return ctx.db
        .query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .take(limit);
    }

    // Get user's liked recipes
    const userLikes = await ctx.db
      .query("likes")
      .withIndex("by_user_recipe", (q) => q.eq("userId", userId))
      .collect();

    const likedRecipeIds = new Set(userLikes.map((l) => l.recipeId));

    if (likedRecipeIds.size === 0) {
      // No likes, return recent popular
      const recipes = await ctx.db
        .query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .take(limit);

      return Promise.all(
        recipes.map(async (r) => ({
          ...r,
          coverImageUrl: r.coverImage ? await ctx.storage.getUrl(r.coverImage) : null,
        }))
      );
    }

    // Get categories of liked recipes
    const likedRecipes = await Promise.all([...likedRecipeIds].slice(0, 10).map((id) => ctx.db.get(id)));
    const categories = [...new Set(likedRecipes.filter(Boolean).map((r) => r!.category))];

    // Find similar recipes in same categories
    const recommendations = [];
    for (const category of categories) {
      const categoryRecipes = await ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published"))
        .order("desc")
        .take(20);

      for (const recipe of categoryRecipes) {
        if (!likedRecipeIds.has(recipe._id) && recipe.userId !== userId) {
          recommendations.push(recipe);
        }
      }
    }

    // Dedupe and limit
    const unique = [...new Map(recommendations.map((r) => [r._id, r])).values()].slice(0, limit);

    return Promise.all(
      unique.map(async (r) => ({
        ...r,
        coverImageUrl: r.coverImage ? await ctx.storage.getUrl(r.coverImage) : null,
      }))
    );
  },
});

// Advanced search
export const search = query({
  args: {
    query: v.optional(v.string()),
    category: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    maxTime: v.optional(v.number()), // max total time in minutes
    ingredient: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { query: searchQuery, category, difficulty, maxTime, ingredient, limit = 20 }) => {
    let recipes;

    if (searchQuery) {
      recipes = await ctx.db
        .query("recipes")
        .withSearchIndex("search_title", (q) => {
          let search = q.search("title", searchQuery);
          if (category) search = search.eq("category", category);
          return search.eq("status", "published");
        })
        .take(100);
    } else if (category) {
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published"))
        .order("desc")
        .take(100);
    } else {
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .take(100);
    }

    // Apply filters
    let filtered = recipes;

    if (difficulty) {
      filtered = filtered.filter((r) => r.difficulty === difficulty);
    }

    if (maxTime) {
      filtered = filtered.filter((r) => {
        const total = (r.prepTime || 0) + (r.cookTime || 0);
        return total > 0 && total <= maxTime;
      });
    }

    if (ingredient) {
      const lower = ingredient.toLowerCase();
      filtered = filtered.filter((r) =>
        r.ingredients.some((i) => i.toLowerCase().includes(lower))
      );
    }

    const limited = filtered.slice(0, limit);

    return Promise.all(
      limited.map(async (r) => ({
        ...r,
        coverImageUrl: r.coverImage ? await ctx.storage.getUrl(r.coverImage) : null,
      }))
    );
  },
});
