export const APP_NAME = "Mise";
export const APP_TITLE_SUFFIX = ` | ${APP_NAME}`;

export const CATEGORIES = [
  "Salads",
  "Pasta",
  "Chicken",
  "Beef & Lamb",
  "Seafood",
  "Vegetarian",
  "Soups",
  "Desserts",
  "Baking",
  "Quick & Easy",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, string> = {
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

export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
