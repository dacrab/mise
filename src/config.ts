// Centralized configuration - edit here to customize the app

export const config = {
  // Recipe categories - add/remove as needed
  categories: [
    'General', 'Breakfast', 'Lunch', 'Dinner', 'Dessert',
    'Vegan', 'Vegetarian', 'Quick & Easy', 'Baking', 'Italian', 'Asian', 'Mexican'
  ] as const,

  // Recipe defaults
  recipe: {
    defaultCategory: 'General',
    defaultStatus: 'published' as const,
    statuses: ['draft', 'published'] as const,
    titleMinLength: 3,
  },

  // Upload limits
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    presignedUrlExpiry: 3600, // 1 hour
    keyPrefix: 'recipes',
  },

  // Comment limits
  comment: {
    minLength: 1,
    maxLength: 500,
  },

  // Protected route prefixes (redirect to login if not authenticated)
  protectedRoutes: ['/dashboard'],

  // Avatar sizes
  avatar: {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-32 h-32 text-4xl',
  },
} as const;

// Type exports for use in components
export type Category = typeof config.categories[number];
export type RecipeStatus = typeof config.recipe.statuses[number];
export type AvatarSize = keyof typeof config.avatar;
