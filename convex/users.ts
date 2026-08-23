import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

export async function withProfileImageUrl<T extends { profileImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  user: T,
): Promise<T & { profileImageUrl: string | null }> {
  return {
    ...user,
    profileImageUrl: user.profileImage ? await ctx.storage.getUrl(user.profileImage) : null,
  };
}

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return withProfileImageUrl(ctx, user);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!user) return null;
    return withProfileImageUrl(ctx, user);
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const patch = { ...args };

    if (patch.username !== undefined) {
      patch.username = patch.username.toLowerCase();
      // Convex has no unique constraints / onConflict; the check-and-patch below
      // is safe because it runs inside one mutation, which is retried when a
      // concurrent claim of the same username writes a conflicting index entry.
      if (!USERNAME_PATTERN.test(patch.username)) {
        throw new ConvexError("Username must be 3-32 characters: lowercase letters, numbers, underscores");
      }
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", patch.username as string))
        .first();
      if (existing && existing._id !== user._id) {
        throw new ConvexError("Username already taken");
      }
    }

    await ctx.db.patch(user._id, patch);

    if (user.profileImage && args.profileImage !== undefined && args.profileImage !== user.profileImage) {
      await ctx.storage.delete(user.profileImage);
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});
