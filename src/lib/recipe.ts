import { ClockIcon, FireIcon, UserGroupIcon } from "@heroicons/react/24/outline";

type RecipeTiming = {
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  difficulty?: string | null;
};

export function recipeStats(recipe: RecipeTiming) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return [
    recipe.prepTime != null && { icon: ClockIcon, label: "Prep", value: `${recipe.prepTime} min` },
    recipe.cookTime != null && { icon: FireIcon, label: "Cook", value: `${recipe.cookTime} min` },
    totalTime > 0 && { icon: ClockIcon, label: "Total", value: `${totalTime} min` },
    recipe.servings != null && { icon: UserGroupIcon, label: "Serves", value: String(recipe.servings) },
    recipe.difficulty && { icon: FireIcon, label: "Level", value: recipe.difficulty },
  ].flatMap((stat) => (stat ? [stat] : []));
}
