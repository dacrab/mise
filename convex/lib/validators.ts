import { paginationResultValidator } from "convex/server";
import { v } from "convex/values";

const recipeFields = {
  slug: v.string(),
  title: v.string(),
  description: v.optional(v.string()),
  category: v.string(),
  ingredients: v.array(v.string()),
  steps: v.array(v.string()),
  coverImage: v.optional(v.id("_storage")),
  videoUrl: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published")),
  userId: v.id("users"),
  servings: v.optional(v.number()),
  prepTime: v.optional(v.number()),
  cookTime: v.optional(v.number()),
  difficulty: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
};

const recipeDocFields = {
  _id: v.id("recipes"),
  _creationTime: v.number(),
  ...recipeFields,
};

export const recipeWithCover = v.object({
  ...recipeDocFields,
  coverImageUrl: v.union(v.string(), v.null()),
});

export const recipePage = paginationResultValidator(recipeWithCover);

export const recipeDetail = v.object({
  ...recipeDocFields,
  coverImageUrl: v.union(v.string(), v.null()),
  author: v.union(
    v.object({
      name: v.optional(v.string()),
      username: v.optional(v.string()),
      profileImageUrl: v.union(v.string(), v.null()),
    }),
    v.null(),
  ),
  isBookmarked: v.boolean(),
});

const userFields = {
  _id: v.id("users"),
  _creationTime: v.number(),
  clerkId: v.string(),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  email: v.optional(v.string()),
  profileImage: v.optional(v.id("_storage")),
  bio: v.optional(v.string()),
};

export const currentUser = v.object({
  ...userFields,
  profileImageUrl: v.union(v.string(), v.null()),
});

export const publicUser = v.object({
  _id: v.id("users"),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  bio: v.optional(v.string()),
  profileImageUrl: v.union(v.string(), v.null()),
});

export const slugEntry = v.object({
  slug: v.string(),
  updatedAt: v.number(),
});
