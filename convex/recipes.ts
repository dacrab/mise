import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId, requireAuth } from "./lib/auth";
import { createNotification } from "./lib/notifications";
import { generateAuthenticatedUploadUrl, withCoverUrl, withCoverUrls } from "./lib/storage";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80); // cap base length
  // Use timestamp + random for extremely low collision probability
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator, category: v.optional(v.string()) },
  handler: async (ctx, { paginationOpts, category }) => {
    const results = category
      ? await ctx.db
          .query("recipes")
          .withIndex("by_category", (q) => q.eq("category", category))
          .filter((q) => q.eq(q.field("status"), "published"))
          .order("desc")
          .paginate(paginationOpts)
      : await ctx.db
          .query("recipes")
          .withIndex("by_status", (q) => q.eq("status", "published"))
          .order("desc")
          .paginate(paginationOpts);
    return { ...results, page: await withCoverUrls(ctx, results.page) };
  },
});

export const list = query({
  args: { search: v.optional(v.string()), category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { search, category, limit = 50 }) => {
    const safeLimit = Math.min(limit, 100);
    let recipes;

    if (search) {
      recipes = await ctx.db
        .query("recipes")
        .withSearchIndex("search_title", (q) => {
          let query = q.search("title", search);
          if (category) query = query.eq("category", category);
          return query.eq("status", "published");
        })
        .take(safeLimit);
    } else if (category) {
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published"))
        .order("desc")
        .take(safeLimit);
    } else {
      recipes = await ctx.db
        .query("recipes")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .order("desc")
        .take(safeLimit);
    }
    return withCoverUrls(ctx, recipes);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const recipe = await ctx.db
      .query("recipes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    if (!recipe) return null;

    const [author, likes, userId] = await Promise.all([
      ctx.db.get(recipe.userId),
      ctx.db
        .query("likes")
        .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
        .collect(),
      getAuthUserId(ctx),
    ]);

    const isLiked = userId ? likes.some((l: { userId: string }) => l.userId === userId) : false;
    const isBookmarked = userId
      ? !!(await ctx.db
          .query("bookmarks")
          .withIndex("by_user_recipe", (q) => q.eq("userId", userId).eq("recipeId", recipe._id))
          .first())
      : false;

    return {
      ...(await withCoverUrl(ctx, recipe)),
      author: author ? { name: author.name, username: author.username, image: author.image } : null,
      likesCount: likes.length,
      isLiked,
      isBookmarked,
    };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUserId = await getAuthUserId(ctx);
    const isOwner = currentUserId === userId;
    const recipes = isOwner
      ? await ctx.db
          .query("recipes")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .order("desc")
          .take(100)
      : await ctx.db
          .query("recipes")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.eq(q.field("status"), "published"))
          .order("desc")
          .take(100);
    return withCoverUrls(ctx, recipes);
  },
});

export const myRecipes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return withCoverUrls(ctx, recipes);
  },
});

export const myBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    const recipes = await Promise.all(bookmarks.map((b) => ctx.db.get(b.recipeId)));
    return withCoverUrls(ctx, recipes.filter(Boolean) as Array<NonNullable<(typeof recipes)[number]>>);
  },
});

export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const recipe = await ctx.db.get(id);
    if (!recipe) return null;
    if (recipe.status === "draft") {
      const userId = await getAuthUserId(ctx);
      if (recipe.userId !== userId) return null;
    }
    return withCoverUrl(ctx, recipe);
  },
});

const recipeArgs = {
  title: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  ingredients: v.array(v.string()),
  steps: v.array(v.string()),
  coverImage: v.optional(v.id("_storage")),
  videoUrl: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published")),
  servings: v.optional(v.number()),
  prepTime: v.optional(v.number()),
  cookTime: v.optional(v.number()),
  difficulty: v.optional(v.string()),
};

export const create = mutation({
  args: recipeArgs,
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    const slug = generateSlug(args.title);
    const id = await ctx.db.insert("recipes", { ...args, slug, userId });
    return { id, slug };
  },
});

export const update = mutation({
  args: { id: v.id("recipes"), ...recipeArgs },
  handler: async (ctx, { id, ...args }) => {
    const userId = await requireAuth(ctx);
    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, args);
    return { slug: recipe.slug };
  },
});

export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== userId) throw new Error("Not found");

    const [comments, likes, bookmarks] = await Promise.all([
      ctx.db
        .query("comments")
        .withIndex("by_recipe", (q) => q.eq("recipeId", id))
        .collect(),
      ctx.db
        .query("likes")
        .withIndex("by_recipe", (q) => q.eq("recipeId", id))
        .collect(),
      ctx.db
        .query("bookmarks")
        .withIndex("by_recipe", (q) => q.eq("recipeId", id))
        .collect(),
    ]);

    await Promise.all([
      ...comments.map((c) => ctx.db.delete(c._id)),
      ...likes.map((l) => ctx.db.delete(l._id)),
      ...bookmarks.map((b) => ctx.db.delete(b._id)),
      recipe.coverImage ? ctx.storage.delete(recipe.coverImage) : Promise.resolve(),
      ctx.db.delete(id),
    ]);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: generateAuthenticatedUploadUrl,
});

export const fork = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const original = await ctx.db.get(id);
    if (!original || original.status !== "published") throw new Error("Recipe not found");

    const slug = generateSlug(original.title);
    const newId = await ctx.db.insert("recipes", {
      title: original.title,
      description: original.description,
      category: original.category,
      ingredients: [...original.ingredients],
      steps: [...original.steps],
      coverImage: original.coverImage,
      videoUrl: original.videoUrl,
      servings: original.servings,
      prepTime: original.prepTime,
      cookTime: original.cookTime,
      difficulty: original.difficulty,
      status: "draft",
      slug,
      userId,
      forkedFrom: id,
    });

    await createNotification(ctx, { userId: original.userId, type: "fork", actorId: userId, recipeId: id });
    return { id: newId, slug };
  },
});

export const publishScheduled = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    // Use by_status index to only scan drafts, then filter by publishAt in memory
    // (Convex doesn't support compound range queries on two fields — this is the correct pattern)
    const drafts = await ctx.db
      .query("recipes")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .take(200);

    const scheduled = drafts.filter((r) => r.publishAt !== undefined && r.publishAt <= now);

    await Promise.all(
      scheduled.map((recipe) => ctx.db.patch(recipe._id, { status: "published", publishAt: undefined }))
    );

    return { published: scheduled.length };
  },
});


