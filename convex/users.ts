import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { findUserByClerkId, getCurrentUser, requireUser } from "./lib/auth";
import { storageUrl } from "./lib/media";
import { deleteRecipeCascade } from "./lib/recipes";
import { currentUser as currentUserValidator, publicUser } from "./lib/validators";

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

async function withProfileImageUrl<T extends { profileImage?: Id<"_storage"> | null }>(
  ctx: QueryCtx,
  user: T,
): Promise<T & { profileImageUrl: string | null }> {
  return {
    ...user,
    profileImageUrl: await storageUrl(ctx, user.profileImage),
  };
}

export const currentUser = query({
  args: {},
  returns: v.union(currentUserValidator, v.null()),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return withProfileImageUrl(ctx, user);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  returns: v.union(publicUser, v.null()),
  handler: async (ctx, { username }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .first();
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      profileImageUrl: await storageUrl(ctx, user.profileImage),
    };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const patch = { ...args };

    if (args.username !== undefined) {
      const username = args.username.toLowerCase();
      if (user.username && username !== user.username) {
        throw new ConvexError("Username cannot be changed");
      }
      if (!USERNAME_PATTERN.test(username)) {
        throw new ConvexError("Username must be 3-32 characters: lowercase letters, numbers, underscores");
      }
      const existing = await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", username))
        .first();
      if (existing && existing._id !== user._id) {
        throw new ConvexError("Username already taken");
      }
      patch.username = username;
    }

    await ctx.db.patch(user._id, patch);

    if (user.profileImage && args.profileImage !== undefined && args.profileImage !== user.profileImage) {
      await ctx.storage.delete(user.profileImage);
    }
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

export const deleteAccount = action({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const secretKey = process.env["CLERK_SECRET_KEY"];
    if (!secretKey) throw new ConvexError("Account deletion is not configured");

    const response = await fetch(`https://api.clerk.com/v1/users/${identity.subject}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!response.ok && response.status !== 404) {
      throw new ConvexError("Could not delete your account. Please try again.");
    }

    await ctx.runMutation(internal.users.deleteAccountData, { clerkId: identity.subject });
    return null;
  },
});

export const deleteAccountData = internalMutation({
  args: { clerkId: v.string() },
  returns: v.null(),
  handler: async (ctx, { clerkId }) => {
    const user = await findUserByClerkId(ctx, clerkId);
    if (!user) return null;

    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const recipe of recipes) await deleteRecipeCascade(ctx, recipe);

    const savedBookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const bookmark of savedBookmarks) await ctx.db.delete(bookmark._id);

    const rateLimits = await ctx.db
      .query("rateLimits")
      .withIndex("by_user_action", (q) => q.eq("userId", user._id))
      .collect();
    for (const limit of rateLimits) await ctx.db.delete(limit._id);

    if (user.profileImage) await ctx.storage.delete(user.profileImage);
    await ctx.db.delete(user._id);
    return null;
  },
});
