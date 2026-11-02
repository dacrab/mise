import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

type SearchableRecipe = {
  title: string;
  description?: string;
  category: string;
  ingredients: string[];
  steps: string[];
};

export function buildSearchText(recipe: SearchableRecipe): string {
  return [recipe.title, recipe.description, recipe.category, ...recipe.ingredients, ...recipe.steps]
    .filter((part): part is string => typeof part === "string" && part.trim() !== "")
    .join("\n");
}

export async function deleteRecipeCascade(ctx: MutationCtx, recipe: Doc<"recipes">): Promise<void> {
  const bookmarks = await ctx.db
    .query("bookmarks")
    .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
    .collect();

  const redirects = await ctx.db
    .query("slugRedirects")
    .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
    .collect();

  const ops: Promise<void>[] = bookmarks.map((bookmark) => ctx.db.delete(bookmark._id));
  ops.push(...redirects.map((redirect) => ctx.db.delete(redirect._id)));
  if (recipe.coverImage) ops.push(ctx.storage.delete(recipe.coverImage));
  ops.push(ctx.db.delete(recipe._id));
  await Promise.all(ops);
}
