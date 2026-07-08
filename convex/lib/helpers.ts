import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function requirePublishedRecipe(ctx: QueryCtx | MutationCtx, recipeId: Id<"recipes">) {
  const recipe = await ctx.db.get(recipeId);
  if (recipe?.status !== "published") throw new Error("Recipe not found");
  return recipe;
}
