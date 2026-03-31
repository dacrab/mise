import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requireAuth } from "./lib/auth";
import { validateLength } from "./lib/validation";
import { withCoverUrls } from "./lib/storage";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Batch all bookmark count queries in parallel
    const counts = await Promise.all(
      collections.map((c) =>
        ctx.db
          .query("bookmarks")
          .withIndex("by_collection", (q) => q.eq("collectionId", c._id))
          .collect()
          .then((b) => b.length)
      )
    );
    return collections.map((c, i) => ({ ...c, count: counts[i] }));
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, { name }) => {
    const userId = await requireAuth(ctx);
    const trimmed = validateLength(name, 1, 50, "Name");
    const id = await ctx.db.insert("collections", { name: trimmed, userId });
    return { id };
  },
});

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

    await Promise.all([...bookmarks.map((b) => ctx.db.patch(b._id, { collectionId: undefined })), ctx.db.delete(id)]);
  },
});

export const getBookmarks = query({
  args: { collectionId: v.optional(v.id("collections")) },
  handler: async (ctx, { collectionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const bookmarks = collectionId
      ? await ctx.db
          .query("bookmarks")
          .withIndex("by_collection", (q) => q.eq("collectionId", collectionId))
          .collect()
      : await ctx.db
          .query("bookmarks")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .filter((q) => q.eq(q.field("collectionId"), undefined))
          .collect();

    const recipes = await Promise.all(bookmarks.map((b) => ctx.db.get(b.recipeId)));
    return withCoverUrls(ctx, recipes.filter(Boolean) as Array<NonNullable<(typeof recipes)[number]>>);
  },
});
