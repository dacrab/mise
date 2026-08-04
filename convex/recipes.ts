import { paginationOptsValidator } from "convex/server";
import { type ObjectType, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { generateAuthenticatedUploadUrl, withCoverUrl, withCoverUrls } from "./lib/storage";
import { checkRateLimit } from "./rateLimit";

export function generateSlug(title: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80) || "recipe";
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

function publishedRecipesQuery(ctx: QueryCtx, category?: string) {
  return category
    ? ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", category))
        .filter((q) => q.eq(q.field("status"), "published"))
    : ctx.db.query("recipes").withIndex("by_status", (q) => q.eq("status", "published"));
}

async function getRecipesByUser(ctx: QueryCtx, userId: Id<"users">, includeDrafts: boolean) {
  const base = ctx.db.query("recipes").withIndex("by_user", (q) => q.eq("userId", userId));
  const query = includeDrafts ? base : base.filter((q) => q.eq(q.field("status"), "published"));
  const recipes = await query.order("desc").take(100);
  return withCoverUrls(ctx, recipes);
}

export const listPaginated = query({
  args: { paginationOpts: paginationOptsValidator, category: v.optional(v.string()) },
  handler: async (ctx, { paginationOpts, category }) => {
    const results = await publishedRecipesQuery(ctx, category).order("desc").paginate(paginationOpts);
    return { ...results, page: await withCoverUrls(ctx, results.page) };
  },
});

export const list = query({
  args: { search: v.optional(v.string()), category: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, { search, category, limit = 50 }) => {
    const safeLimit = Math.min(limit, 100);

    const rows = search
      ? await ctx.db
          .query("recipes")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", search);
            if (category) query = query.eq("category", category);
            return query.eq("status", "published");
          })
          .take(safeLimit)
      : await publishedRecipesQuery(ctx, category).order("desc").take(safeLimit);

    return withCoverUrls(ctx, rows);
  },
});

export const listSlugs = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(1000);
    return recipes.map((r) => ({ slug: r.slug, updatedAt: r._creationTime }));
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

    const currentUser = await getCurrentUser(ctx);
    if (recipe.status !== "published" && recipe.userId !== currentUser?._id) return null;

    const author = await ctx.db.get(recipe.userId);
    const isBookmarked = currentUser
      ? !!(await ctx.db
          .query("bookmarks")
          .withIndex("by_user_recipe", (q) => q.eq("userId", currentUser._id).eq("recipeId", recipe._id))
          .first())
      : false;

    return {
      ...(await withCoverUrl(ctx, recipe)),
      author: author
        ? {
            name: author.name,
            username: author.username,
            image: author.image,
            profileImageUrl: author.profileImage ? await ctx.storage.getUrl(author.profileImage) : null,
          }
        : null,
      isBookmarked,
    };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUser(ctx);
    return getRecipesByUser(ctx, userId, currentUser?._id === userId);
  },
});

export const myRecipes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return getRecipesByUser(ctx, user._id, true);
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

type RecipeArgs = ObjectType<typeof recipeArgs>;

function assertPublishable(args: Pick<RecipeArgs, "status" | "ingredients" | "steps">) {
  if (args.status === "published" && (args.ingredients.length === 0 || args.steps.length === 0)) {
    throw new Error("Published recipes need at least one ingredient and one step");
  }
}

export const create = mutation({
  args: recipeArgs,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await checkRateLimit(ctx, user._id, "recipe:create");
    assertPublishable(args);
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
    assertPublishable(args);
    await ctx.db.patch(id, args);
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

    const ops = [...bookmarks.map((b) => ctx.db.delete(b._id))];
    if (recipe.coverImage) ops.push(ctx.storage.delete(recipe.coverImage));
    ops.push(ctx.db.delete(id));
    await Promise.all(ops);
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: generateAuthenticatedUploadUrl,
});
