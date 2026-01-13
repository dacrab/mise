import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Generate slug from title
const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") +
  "-" + Math.random().toString(36).slice(2, 8);

// List published recipes with optional filters
export const list = query({
  args: {
    search: v.optional(v.string()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { search, category, limit = 50 }) => {
    let recipes;

    if (search) {
      recipes = await ctx.db
        .query("recipes")
        .withSearchIndex("search_title", (q) => {
          let query = q.search("title", search);
          if (category) query = query.eq("category", category);
          return query.eq("status", "published");
        })
        .take(limit);
    } else if (category) {
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published"))
        .order("desc")
        .take(limit);
    } else {
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .take(limit);
    }

    return Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        coverImageUrl: recipe.coverImage
          ? await ctx.storage.getUrl(recipe.coverImage)
          : null,
      }))
    );
  },
});

// Get recipe by slug with author info
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const recipe = await ctx.db
      .query("recipes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!recipe) return null;

    const author = await ctx.db.get(recipe.userId);
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
      .collect();

    const userId = await getAuthUserId(ctx);
    const isLiked = userId
      ? likes.some((l) => l.userId === userId)
      : false;
    const isBookmarked = userId
      ? !!(await ctx.db
          .query("bookmarks")
          .withIndex("by_user_recipe", (q) =>
            q.eq("userId", userId).eq("recipeId", recipe._id)
          )
          .first())
      : false;

    return {
      ...recipe,
      coverImageUrl: recipe.coverImage
        ? await ctx.storage.getUrl(recipe.coverImage)
        : null,
      author: author
        ? { name: author.name, username: author.username, image: author.image }
        : null,
      likesCount: likes.length,
      isLiked,
      isBookmarked,
    };
  },
});

// Get recipes by user
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        coverImageUrl: recipe.coverImage
          ? await ctx.storage.getUrl(recipe.coverImage)
          : null,
      }))
    );
  },
});

// Get current user's recipes
export const myRecipes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        coverImageUrl: recipe.coverImage
          ? await ctx.storage.getUrl(recipe.coverImage)
          : null,
      }))
    );
  },
});

// Get user's bookmarked recipes
export const myBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const recipes = await Promise.all(
      bookmarks.map((b) => ctx.db.get(b.recipeId))
    );

    return Promise.all(
      recipes.filter(Boolean).map(async (recipe) => ({
        ...recipe!,
        coverImageUrl: recipe!.coverImage
          ? await ctx.storage.getUrl(recipe!.coverImage)
          : null,
      }))
    );
  },
});

// Get recipe by ID (for editing)
export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const recipe = await ctx.db.get(id);
    if (!recipe) return null;

    return {
      ...recipe,
      coverImageUrl: recipe.coverImage
        ? await ctx.storage.getUrl(recipe.coverImage)
        : null,
    };
  },
});

// Create recipe
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    coverImage: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const slug = generateSlug(args.title);
    const id = await ctx.db.insert("recipes", { ...args, slug, userId });
    return { id, slug };
  },
});

// Update recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    coverImage: v.optional(v.id("_storage")),
    videoUrl: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  handler: async (ctx, { id, ...args }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(id, args);
    return { slug: recipe.slug };
  },
});

// Delete recipe
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== userId) throw new Error("Not found");

    // Delete related data
    const [comments, likes, bookmarks] = await Promise.all([
      ctx.db.query("comments").withIndex("by_recipe", (q) => q.eq("recipeId", id)).collect(),
      ctx.db.query("likes").withIndex("by_recipe", (q) => q.eq("recipeId", id)).collect(),
      ctx.db.query("bookmarks").withIndex("by_user_recipe").collect(),
    ]);

    await Promise.all([
      ...comments.map((c) => ctx.db.delete(c._id)),
      ...likes.map((l) => ctx.db.delete(l._id)),
      ...bookmarks.filter((b) => b.recipeId === id).map((b) => ctx.db.delete(b._id)),
      recipe.coverImage ? ctx.storage.delete(recipe.coverImage) : Promise.resolve(),
      ctx.db.delete(id),
    ]);
  },
});

// Generate upload URL for cover image
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});
