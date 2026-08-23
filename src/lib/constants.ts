import { RECIPE_CATEGORIES } from "convex/lib/categories";

const APP_NAME = "Mise";
export const APP_TITLE_SUFFIX = ` | ${APP_NAME}`;

export const CATEGORIES = RECIPE_CATEGORIES;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, string> = {
  General: "🍽️",
  Salads: "🥗",
  Pasta: "🍝",
  Chicken: "🍗",
  "Beef & Lamb": "🥩",
  Seafood: "🐟",
  Vegetarian: "🌱",
  Soups: "🍲",
  Desserts: "🍰",
  Baking: "🥐",
  "Quick & Easy": "⚡",
};

export const FOOTER_LINKS = [
  { to: "/about", label: "About" },
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
] as const;

export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;

export const MIN_PREP_MINUTES = 0;
export const MAX_PREP_MINUTES = 24 * 60;
export const MIN_COOK_MINUTES = 0;
export const MAX_COOK_MINUTES = 24 * 60;
export const MIN_SERVINGS = 1;
export const MAX_SERVINGS = 100;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
