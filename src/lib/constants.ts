export const APP_NAME = "Mise";
export const APP_TITLE_SUFFIX = ` | ${APP_NAME}`;

/** Recipe categories — used in editor, discovery filters, and search. */
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

/** Emoji icon for each recipe category. */
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

/** Recipe difficulty levels — ordered easiest to hardest. */
export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Expert"] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];
