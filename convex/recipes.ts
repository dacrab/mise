import { paginationOptsValidator } from "convex/server";
import { ConvexError, type ObjectType, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { RECIPE_CATEGORIES } from "./lib/categories";
import { assertImageUpload, storageUrl } from "./lib/media";
import { buildSearchText, deleteRecipeCascade } from "./lib/recipes";
import { recipeDetail, recipePage, recipeWithCover, slugEntry } from "./lib/validators";
import { checkRateLimit } from "./rateLimit";

const MAX_RECIPES_PER_QUERY = 100;
const MAX_BOOKMARKS_PER_QUERY = 100;
const SITEMAP_SLUG_LIMIT = 1000;

export function generateSlug(title: string, suffix?: string): string {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 80) || "recipe";
  return suffix ? `${base}-${suffix}` : base;
}

async function isSlugTaken(ctx: MutationCtx, slug: string, recipeId?: Id<"recipes">): Promise<boolean> {
  const recipe = await ctx.db
    .query("recipes")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  if (recipe && recipe._id !== recipeId) return true;

  const redirect = await ctx.db
    .query("slugRedirects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();
  return !!redirect && redirect.recipeId !== recipeId;
}

async function generateUniqueSlug(ctx: MutationCtx, title: string, recipeId?: Id<"recipes">): Promise<string> {
  const base = generateSlug(title);
  let counter = 0;
  for (;;) {
    const candidate = counter === 0 ? base : `${base}-${counter.toString(36)}`;
    if (!(await isSlugTaken(ctx, candidate, recipeId))) return candidate;
    counter++;
  }
}

async function recordSlugRedirect(ctx: MutationCtx, slug: string, recipeId: Id<"recipes">): Promise<void> {
  const existing = await ctx.db
    .query("slugRedirects")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  if (!existing) {
    await ctx.db.insert("slugRedirects", { slug, recipeId });
  } else if (existing.recipeId !== recipeId) {
    await ctx.db.patch(existing._id, { recipeId });
  }
}

function omitSearchText<T extends { searchText?: string }>(recipe: T): Omit<T, "searchText"> {
  const { searchText, ...rest } = recipe;
  return rest;
}

async function withCoverUrl<T extends { coverImage?: Id<"_storage"> | null; searchText?: string }>(
  ctx: QueryCtx,
  item: T,
): Promise<Omit<T, "searchText"> & { coverImageUrl: string | null }> {
  return {
    ...omitSearchText(item),
    coverImageUrl: await storageUrl(ctx, item.coverImage),
  };
}

async function withCoverUrls<T extends { coverImage?: Id<"_storage"> | null; searchText?: string }>(
  ctx: QueryCtx,
  items: T[],
): Promise<Array<Omit<T, "searchText"> & { coverImageUrl: string | null }>> {
  return Promise.all(items.map((item) => withCoverUrl(ctx, item)));
}

function publishedRecipesQuery(ctx: QueryCtx, category?: string) {
  return category
    ? ctx.db
        .query("recipes")
        .withIndex("by_category_status_publishedAt", (q) => q.eq("category", category).eq("status", "published"))
    : ctx.db.query("recipes").withIndex("by_status_publishedAt", (q) => q.eq("status", "published"));
}

async function getRecipesByUser(ctx: QueryCtx, userId: Id<"users">, includeDrafts: boolean) {
  const base = ctx.db.query("recipes").withIndex("by_user", (q) => q.eq("userId", userId));
  const query = includeDrafts ? base : base.filter((q) => q.eq(q.field("status"), "published"));
  const recipes = await query.order("desc").take(MAX_RECIPES_PER_QUERY);
  return withCoverUrls(ctx, recipes);
}

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: recipePage,
  handler: async (ctx, { paginationOpts, search, category }) => {
    const opts = { ...paginationOpts, numItems: Math.min(paginationOpts.numItems, MAX_RECIPES_PER_QUERY) };

    const results = search
      ? await ctx.db
          .query("recipes")
          .withSearchIndex("search_recipes", (q) => {
            let query = q.search("searchText", search);
            if (category) query = query.eq("category", category);
            return query.eq("status", "published");
          })
          .paginate(opts)
      : await publishedRecipesQuery(ctx, category).order("desc").paginate(opts);

    return { ...results, page: await withCoverUrls(ctx, results.page) };
  },
});

export const listSlugs = query({
  args: {},
  returns: v.array(slugEntry),
  handler: async (ctx) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .order("desc")
      .take(SITEMAP_SLUG_LIMIT);
    return recipes.map((r) => ({ slug: r.slug, updatedAt: r.updatedAt ?? r.publishedAt ?? r._creationTime }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  returns: v.union(recipeDetail, v.null()),
  handler: async (ctx, { slug }) => {
    let recipe = await ctx.db
      .query("recipes")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();

    if (!recipe) {
      const redirect = await ctx.db
        .query("slugRedirects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!redirect) return null;
      recipe = await ctx.db.get(redirect.recipeId);
      if (!recipe) return null;
    }

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
      canonicalSlug: recipe.slug,
      author: author
        ? {
            name: author.name,
            username: author.username,
            profileImageUrl: await storageUrl(ctx, author.profileImage),
          }
        : null,
      isBookmarked,
    };
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  returns: v.array(recipeWithCover),
  handler: async (ctx, { userId }) => {
    const currentUser = await getCurrentUser(ctx);
    return getRecipesByUser(ctx, userId, currentUser?._id === userId);
  },
});

export const myRecipes = query({
  args: {},
  returns: v.array(recipeWithCover),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return getRecipesByUser(ctx, user._id, true);
  },
});

export const myBookmarks = query({
  args: {},
  returns: v.array(recipeWithCover),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_BOOKMARKS_PER_QUERY);
    const recipes = (await Promise.all(bookmarks.map((b) => ctx.db.get(b.recipeId)))).filter(
      (r): r is NonNullable<typeof r> => r !== null && r.status === "published",
    );
    return withCoverUrls(ctx, recipes);
  },
});

export const getById = query({
  args: { id: v.id("recipes") },
  returns: v.union(recipeWithCover, v.null()),
  handler: async (ctx, { id }) => {
    const recipe = await ctx.db.get(id);
    if (!recipe) return null;
    if (recipe.status !== "published") {
      const user = await getCurrentUser(ctx);
      if (recipe.userId !== user?._id) return null;
    }
    return withCoverUrl(ctx, recipe);
  },
});

const recipeArgs = {
  title: v.string(),
  description: v.optional(v.string()),
  category: v.union(...RECIPE_CATEGORIES.map((c) => v.literal(c))),
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

function assertVideoUrl(videoUrl: string | undefined) {
  if (videoUrl === undefined || videoUrl.trim() === "") return;

  let parsed: URL;
  try {
    parsed = new URL(videoUrl);
  } catch {
    throw new ConvexError("Video URL must be a valid link");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ConvexError("Video URL must start with http:// or https://");
  }
}

function assertPublishable(args: Pick<RecipeArgs, "status" | "title" | "ingredients" | "steps">) {
  if (args.status !== "published") return;
  const hasText = (items: string[]) => items.some((item) => item.trim() !== "");
  if (!(args.title.trim() && hasText(args.ingredients) && hasText(args.steps))) {
    throw new ConvexError("Published recipes need a title, at least one ingredient, and one step");
  }
}

export const create = mutation({
  args: recipeArgs,
  returns: v.object({ id: v.id("recipes"), slug: v.string() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await checkRateLimit(ctx, user._id, "recipe:create");
    assertPublishable(args);
    assertVideoUrl(args.videoUrl);
    if (args.coverImage !== undefined) await assertImageUpload(ctx, args.coverImage);

    const slug = await generateUniqueSlug(ctx, args.title);
    const now = Date.now();
    const id = await ctx.db.insert("recipes", {
      ...args,
      slug,
      userId: user._id,
      updatedAt: now,
      searchText: buildSearchText(args),
      ...(args.status === "published" ? { publishedAt: now } : {}),
    });
    return { id, slug };
  },
});

export const update = mutation({
  args: { id: v.id("recipes"), ...recipeArgs },
  returns: v.null(),
  handler: async (ctx, { id, ...args }) => {
    const user = await requireUser(ctx);
    await checkRateLimit(ctx, user._id, "recipe:update");
    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== user._id) throw new ConvexError("Recipe not found");
    assertPublishable(args);
    assertVideoUrl(args.videoUrl);
    if (args.coverImage !== undefined) await assertImageUpload(ctx, args.coverImage);

    const slug = args.title === recipe.title ? recipe.slug : await generateUniqueSlug(ctx, args.title, id);
    const now = Date.now();
    const publishedAt = args.status === "published" ? (recipe.publishedAt ?? now) : recipe.publishedAt;

    await ctx.db.patch(id, {
      ...args,
      slug,
      updatedAt: now,
      searchText: buildSearchText(args),
      ...(publishedAt === undefined ? {} : { publishedAt }),
    });

    if (slug !== recipe.slug) await recordSlugRedirect(ctx, recipe.slug, id);
    if (args.coverImage !== undefined && recipe.coverImage && recipe.coverImage !== args.coverImage) {
      await ctx.storage.delete(recipe.coverImage);
    }
    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("recipes") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const recipe = await ctx.db.get(id);
    if (!recipe || recipe.userId !== user._id) throw new ConvexError("Recipe not found");
    await deleteRecipeCascade(ctx, recipe);
    return null;
  },
});
