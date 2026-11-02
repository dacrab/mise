import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { buildSearchText } from "./lib/recipes";

const PAGE_SIZE = 100;

export const backfillPage = internalMutation({
  args: { cursor: v.union(v.string(), v.null()) },
  returns: v.object({
    processed: v.number(),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, { cursor }) => {
    const result = await ctx.db.query("recipes").paginate({ numItems: PAGE_SIZE, cursor });

    for (const recipe of result.page) {
      const patch: { searchText?: string; publishedAt?: number } = {};
      if (recipe.searchText === undefined) patch.searchText = buildSearchText(recipe);
      if (recipe.status === "published" && recipe.publishedAt === undefined) {
        patch.publishedAt = recipe.updatedAt ?? recipe._creationTime;
      }
      if (Object.keys(patch).length > 0) await ctx.db.patch(recipe._id, patch);
    }

    return {
      processed: result.page.length,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

export const backfill = internalAction({
  args: {},
  returns: v.object({ processed: v.number() }),
  handler: async (ctx) => {
    let cursor: string | null = null;
    let processed = 0;

    for (;;) {
      const result: { processed: number; isDone: boolean; continueCursor: string } = await ctx.runMutation(
        internal.migrations.backfillPage,
        { cursor },
      );
      processed += result.processed;
      if (result.isDone) break;
      cursor = result.continueCursor;
    }

    return { processed };
  },
});
