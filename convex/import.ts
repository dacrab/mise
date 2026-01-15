"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

// Simple recipe extraction from URL using JSON-LD schema
export const importFromUrl = action({
  args: { url: v.string() },
  handler: async (_, { url }) => {
    const res = await fetch(url, { headers: { "User-Agent": "Mise Recipe Importer" } });
    if (!res.ok) throw new Error("Failed to fetch URL");

    const html = await res.text();

    // Try JSON-LD first (most recipe sites use this)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const json = match.replace(/<\/?script[^>]*>/gi, "");
          const data = JSON.parse(json);
          const recipe = Array.isArray(data) ? data.find((d) => d["@type"] === "Recipe") : data["@type"] === "Recipe" ? data : null;

          if (recipe) {
            return {
              title: recipe.name || "",
              description: recipe.description || "",
              ingredients: (recipe.recipeIngredient || []).map((i: string) => i.trim()),
              steps: (recipe.recipeInstructions || []).map((s: { text?: string } | string) =>
                typeof s === "string" ? s.trim() : s.text?.trim() || ""
              ).filter(Boolean),
              prepTime: parseTime(recipe.prepTime),
              cookTime: parseTime(recipe.cookTime),
              servings: parseInt(recipe.recipeYield) || undefined,
              imageUrl: typeof recipe.image === "string" ? recipe.image : recipe.image?.[0] || recipe.image?.url,
              source: url,
            };
          }
        } catch { /* continue */ }
      }
    }

    throw new Error("Could not extract recipe from URL. Try a site with structured recipe data.");
  },
});

function parseTime(iso?: string): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;
  return (parseInt(match[1] || "0") * 60) + parseInt(match[2] || "0");
}
