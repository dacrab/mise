import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

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
