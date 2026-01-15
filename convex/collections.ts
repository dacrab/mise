import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, getOptionalAuth, withCoverUrls, validateLength } from "./lib/helpers";

// List user's collections
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getOptionalAuth(ctx);
    if (!userId) return [];

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return Promise.all(
      collections.map(async (c) => {
        const bookmarks = await ctx.db
          .query("bookmarks")
          .withIndex("by_collection", (q) => q.eq("collectionId", c._id))
          .collect();
        return { ...c, count: bookmarks.length };
      })
    );
  },
});

// Create collection
export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await requireAuth(ctx);
    const trimmed = validateLength(name, 1, 50, "Name");
    const id = await ctx.db.insert("collections", { name: trimmed, userId });
    return { id };
  },
});

// Delete collection
export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, { id }) => {
    const userId = await requireAuth(ctx);
    const collection = await ctx.db.get(id);
    if (!collection || collection.userId !== userId) throw new Error("Not found");

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_collection", (q) => q.eq("collectionId", id))
      .collect();

    await Promise.all([
      ...bookmarks.map((b) => ctx.db.patch(b._id, { collectionId: undefined })),
      ctx.db.delete(id),
    ]);
  },
});

// Move bookmark to collection
export const moveBookmark = mutation({
  args: { bookmarkId: v.id("bookmarks"), collectionId: v.optional(v.id("collections")) },
  handler: async (ctx, { bookmarkId, collectionId }) => {
    const userId = await requireAuth(ctx);
    const bookmark = await ctx.db.get(bookmarkId);
    if (!bookmark || bookmark.userId !== userId) throw new Error("Not found");

    if (collectionId) {
      const collection = await ctx.db.get(collectionId);
      if (!collection || collection.userId !== userId) throw new Error("Collection not found");
    }

    await ctx.db.patch(bookmarkId, { collectionId });
  },
});

// Get bookmarks by collection
export const getBookmarks = query({
  args: { collectionId: v.optional(v.id("collections")) },
  handler: async (ctx, { collectionId }) => {
    const userId = await getOptionalAuth(ctx);
    if (!userId) return [];

    const bookmarks = collectionId
      ? await ctx.db.query("bookmarks").withIndex("by_collection", (q) => q.eq("collectionId", collectionId)).collect()
      : await ctx.db.query("bookmarks").withIndex("by_user", (q) => q.eq("userId", userId)).filter((q) => q.eq(q.field("collectionId"), undefined)).collect();

    const recipes = await Promise.all(bookmarks.map((b) => ctx.db.get(b.recipeId)));
    return withCoverUrls(ctx, recipes.filter(Boolean) as NonNullable<typeof recipes[number]>[]);
  },
});
