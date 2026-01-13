import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// List user's collections
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get bookmark counts for each collection
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
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 50) {
      throw new Error("Name must be 1-50 characters");
    }

    const id = await ctx.db.insert("collections", { name: trimmed, userId });
    return { id };
  },
});

// Delete collection (moves bookmarks to uncategorized)
export const remove = mutation({
  args: { id: v.id("collections") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const collection = await ctx.db.get(id);
    if (!collection || collection.userId !== userId) throw new Error("Not found");

    // Move bookmarks to uncategorized
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
  args: {
    bookmarkId: v.id("bookmarks"),
    collectionId: v.optional(v.id("collections")),
  },
  handler: async (ctx, { bookmarkId, collectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

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
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let bookmarks;
    if (collectionId) {
      bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_collection", (q) => q.eq("collectionId", collectionId))
        .collect();
    } else {
      // Uncategorized bookmarks
      bookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("collectionId"), undefined))
        .collect();
    }

    const recipes = await Promise.all(bookmarks.map((b) => ctx.db.get(b.recipeId)));

    return Promise.all(
      recipes.filter(Boolean).map(async (recipe) => ({
        ...recipe!,
        coverImageUrl: recipe!.coverImage ? await ctx.storage.getUrl(recipe!.coverImage) : null,
      }))
    );
  },
});
