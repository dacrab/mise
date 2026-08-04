import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    profileImage: v.optional(v.id("_storage")),
    bio: v.optional(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_username", ["username"]),

  recipes: defineTable({
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
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["status", "category"] }),

  bookmarks: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),

  rateLimits: defineTable({
    userId: v.id("users"),
    action: v.string(),
  }).index("by_user_action", ["userId", "action"]),
});
