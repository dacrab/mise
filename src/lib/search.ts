export function filterRecipes<T extends { title: string; category: string; ingredients: string[] }>(
  recipes: T[],
  query: string,
): T[] {
  const q = query.toLowerCase().trim();
  if (!q) return recipes;
  return recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.toLowerCase().includes(q)),
  );
}
