import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

export type NotificationType = "like" | "comment" | "follow" | "fork";

export async function createNotification(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    type: NotificationType;
    actorId: Id<"users">;
    recipeId?: Id<"recipes">;
  }
) {
  if (args.userId === args.actorId) return;
  await ctx.db.insert("notifications", { ...args, read: false });
}
