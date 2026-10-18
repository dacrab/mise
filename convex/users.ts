import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";

const USERNAME_PATTERN = /^[a-z0-9_]{3,32}$/;

async function withProfileImageUrl<T extends { profileImage?: Id<"_storage"> | null }>(
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
    // Public profile: return display fields only. The raw document also carries
    // `clerkId` and `email`, which every visitor must not be able to read.
    return withProfileImageUrl(ctx, {
      _id: user._id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      image: user.image,
      profileImage: user.profileImage,
    });
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

    if (args.username !== undefined) {
      const username = args.username.toLowerCase();
      if (user.username && username !== user.username) {
        throw new ConvexError("Username cannot be changed");
      }
      // Convex has no unique constraints / onConflict; the check-and-patch below
      // is safe because it runs inside one mutation, which is retried when a
      // concurrent claim of the same username writes a conflicting index entry.
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
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return ctx.storage.generateUploadUrl();
  },
});

/**
 * Permanently deletes the signed-in user's account.
 *
 * The Clerk user is removed first with the Clerk Backend API so the account can
 * no longer sign in. Only after that succeeds do we cascade-delete the app data
 * (recipes, bookmarks, rate limits, uploaded images). If the data deletion were
 * to fail, the user is already locked out and the orphaned rows are unreachable.
 */
export const deleteAccount = action({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const secretKey = process.env["CLERK_SECRET_KEY"];
    if (!secretKey) throw new ConvexError("Account deletion is not configured");

    const response = await fetch(`https://api.clerk.com/v1/users/${identity.subject}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    // 404 means the Clerk user is already gone, which is the desired end state.
    if (!response.ok && response.status !== 404) {
      throw new ConvexError("Could not delete your account. Please try again.");
    }

    await ctx.runMutation(internal.users.deleteAccountData, { clerkId: identity.subject });
  },
});

export const deleteAccountData = internalMutation({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first();
    if (!user) return;

    // Recipes the user authored, plus bookmarks other users left on them.
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    for (const recipe of recipes) {
      const recipeBookmarks = await ctx.db
        .query("bookmarks")
        .withIndex("by_recipe", (q) => q.eq("recipeId", recipe._id))
        .collect();
      for (const bookmark of recipeBookmarks) await ctx.db.delete(bookmark._id);
      if (recipe.coverImage) await ctx.storage.delete(recipe.coverImage);
      await ctx.db.delete(recipe._id);
    }

    // Bookmarks the user saved on other people's recipes.
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
  },
});
