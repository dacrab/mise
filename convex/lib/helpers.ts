import { QueryCtx, MutationCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "../_generated/dataModel";

export async function requireAuth(ctx: MutationCtx | QueryCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getOptionalAuth(ctx: QueryCtx) {
  return await getAuthUserId(ctx);
}

export async function withCoverUrls<T extends { coverImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  items: T[]
): Promise<(T & { coverImageUrl: string | null })[]> {
  return Promise.all(
    items.map(async (item) => ({
      ...item,
      coverImageUrl: item.coverImage ? await ctx.storage.getUrl(item.coverImage) : null,
    }))
  );
}

export async function withCoverUrl<T extends { coverImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  item: T
): Promise<T & { coverImageUrl: string | null }> {
  return {
    ...item,
    coverImageUrl: item.coverImage ? await ctx.storage.getUrl(item.coverImage) : null,
  };
}

export async function requirePublishedRecipe(ctx: QueryCtx | MutationCtx, recipeId: Id<"recipes">) {
  const recipe = await ctx.db.get(recipeId);
  if (!recipe || recipe.status !== "published") throw new Error("Recipe not found");
  return recipe;
}

export async function createNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: "like" | "comment" | "follow" | "fork";
    actorId: Id<"users">;
    recipeId?: Id<"recipes">;
  }
) {
  if (args.userId === args.actorId) return;
  await ctx.db.insert("notifications", { ...args, read: false });
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function validateLength(value: string, min: number, max: number, field: string) {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new Error(`${field} must be ${min}-${max} characters`);
  }
  return trimmed;
}
