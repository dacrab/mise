import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export async function deleteRecipeCascade(ctx: MutationCtx, recipe: Doc<"recipes">): Promise<void> {
  const bookmarks = await ctx.db
    .query("bookmarks")
    .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
    .collect();

  const ops: Promise<void>[] = bookmarks.map((bookmark) => ctx.db.delete(bookmark._id));
  if (recipe.coverImage) ops.push(ctx.storage.delete(recipe.coverImage));
  ops.push(ctx.db.delete(recipe._id));
  await Promise.all(ops);
}
