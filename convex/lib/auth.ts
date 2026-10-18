import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

function findUserByClerkId(ctx: QueryCtx, clerkId: string): Promise<Doc<"users"> | null> {
  return ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
}

export async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return findUserByClerkId(ctx, identity.subject);
}

export async function requireUser(ctx: MutationCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const existing = await findUserByClerkId(ctx, identity.subject);
  if (existing) return existing;

  const id = await ctx.db.insert("users", {
    clerkId: identity.subject,
    email: identity.email,
    name: identity.name,
  });
  const created = await ctx.db.get(id);
  if (!created) throw new Error("Unauthorized");
  return created;
}
