export const APP_NAME = "Mise";
export const APP_TITLE_SUFFIX = ` | ${APP_NAME}`;

export const CATEGORIES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Vegan",
  "Quick & Easy",
  "Baking",
  "Italian",
  "Asian",
  "Mexican",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_ICONS: Record<Category, string> = {
  Breakfast: "☀️",
  Lunch: "🥗",
  Dinner: "🍽️",
  Dessert: "🍰",
  Vegan: "🌱",
  "Quick & Easy": "⚡",
  Baking: "🥐",
  Italian: "🍝",
  Asian: "🍜",
  Mexican: "🌮",
};

export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
