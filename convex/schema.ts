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
    publishAt: v.optional(v.float64()), // scheduled publishing
    userId: v.id("users"),
    forkedFrom: v.optional(v.id("recipes")),
    servings: v.optional(v.number()),
    prepTime: v.optional(v.number()),
    cookTime: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
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
  })
    .index("by_recipe", ["recipeId"])
    .index("by_user", ["userId"]),

  likes: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),

  bookmarks: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
    collectionId: v.optional(v.id("collections")),
  })
    .index("by_user", ["userId"])
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"])
    .index("by_collection", ["collectionId"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("like"), v.literal("comment"), v.literal("follow"), v.literal("fork")),
    actorId: v.id("users"),
    recipeId: v.optional(v.id("recipes")),
    read: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "read"]),

  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_pair", ["followerId", "followingId"]),

  ratings: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
    value: v.number(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),

  collections: defineTable({
    name: v.string(),
    userId: v.id("users"),
    isDefault: v.optional(v.boolean()),
  }).index("by_user", ["userId"]),

  recipeViews: defineTable({
    recipeId: v.id("recipes"),
    timestamp: v.float64(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_recipe_timestamp", ["recipeId", "timestamp"]),

  // Live presence - who's cooking this recipe right now
  presence: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
    lastSeen: v.float64(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_user_recipe", ["userId", "recipeId"]),
});
