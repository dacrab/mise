import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
  })
    .index("by_email", ["email"])
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
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"])
    .searchIndex("search_title", { searchField: "title", filterFields: ["status", "category"] }),

  comments: defineTable({
    content: v.string(),
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  }).index("by_recipe", ["recipeId"]),

  likes: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),

  bookmarks: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_recipe", ["userId", "recipeId"]),
});
