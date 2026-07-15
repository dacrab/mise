import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { generateSlug } from "./lib/slug";
import { generateAuthenticatedUploadUrl, withCoverUrl, withCoverUrls } from "./lib/storage";
import { checkRateLimit } from "./rateLimit";

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
    let recipes: Doc<"recipes">[];

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
    if (recipe.status !== "published") {
      const user = await getCurrentUser(ctx);
      if (recipe.userId !== user?._id) return null;
    }

    const [author, currentUser] = await Promise.all([ctx.db.get(recipe.userId), getCurrentUser(ctx)]);

    const isBookmarked = currentUser
      ? !!(await ctx.db
          .query("bookmarks")
          .withIndex("by_user_recipe", (q) => q.eq("userId", currentUser._id).eq("recipeId", recipe._id))
          .first())
      : false;

    return {
      ...(await withCoverUrl(ctx, recipe)),
      author: author ? { name: author.name, username: author.username, image: author.image } : null,
      isBookmarked,
    };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUser(ctx);
    const isOwner = currentUser?._id === userId;
    const base = ctx.db.query("recipes").withIndex("by_user", (q) => q.eq("userId", userId));
    const recipes = await (isOwner ? base : base.filter((q) => q.eq(q.field("status"), "published")))
      .order("desc")
      .take(100);
    return withCoverUrls(ctx, recipes);
  },
});

export const myRecipes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
    return withCoverUrls(ctx, recipes);
  },
});

export const myBookmarks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);
    const recipes = (await Promise.all(bookmarks.map((b) => ctx.db.get(b.recipeId)))).filter(
      (r): r is NonNullable<typeof r> => r !== null,
    );
    return withCoverUrls(ctx, recipes);
  },
});

export const getById = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const recipe = await ctx.db.get(id);
    if (!recipe) return null;
    if (recipe.status === "draft") {
      const user = await getCurrentUser(ctx);
      if (recipe.userId !== user?._id) return null;
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
    const user = await requireUser(ctx);
    await checkRateLimit(ctx, user._id, "recipe:create");
    const slug = generateSlug(args.title);
    const id = await ctx.db.insert("recipes", { ...args, slug, userId: user._id });
    return { id, slug };
  },
});

export const update = mutation({
  args: { id: v.id("recipes"), ...recipeArgs },
  handler: async (ctx, { id, ...args }) => {
    const user = await requireUser(ctx);
    await checkRateLimit(ctx, user._id, "recipe:update");
    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== user._id) throw new Error("Not found");
    await ctx.db.patch(id, args);
    return { slug: recipe.slug };
  },
});

export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== user._id) throw new Error("Not found");

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_recipe", (q) => q.eq("recipeId", id))
      .collect();

    await Promise.all([
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
