import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null>;
export async function getCurrentUser(ctx: MutationCtx): Promise<Doc<"users"> | null>;
export async function getCurrentUser(ctx: ActionCtx): Promise<Doc<"users"> | null>;
export async function getCurrentUser(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<Doc<"users"> | null>;
export async function getCurrentUser(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const clerkId = identity.subject;

  // Actions don't have direct DB access; delegate to an internal mutation.
  if (!("db" in ctx)) {
    return ctx.runMutation(internal.users.ensureCurrentUser, {}) as Promise<Doc<"users">>;
  }

  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .first();
  if (existing) return existing;

  // Queries are read-only, so we can only lazy-create inside a mutation.
  if ("insert" in ctx.db) {
    const mutationCtx = ctx as MutationCtx;
    const newId = await mutationCtx.db.insert("users", {
      clerkId,
      email: identity.email ?? "",
      name: identity.name ?? identity.email ?? "",
    });
    return mutationCtx.db.get(newId);
  }

  return null;
}

export async function requireUser(ctx: QueryCtx | MutationCtx | ActionCtx): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Unauthorized");
  return user;
}
