import { api } from "convex/_generated/api";
import { useAction } from "convex/react";
import { useState } from "react";

type ImportedRecipe = {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  imageUrl?: string;
  source: string;
};

export function RecipeImporter({ onImport }: { onImport: (recipe: ImportedRecipe) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const importRecipe = useAction(api["recipeImport"].importFromUrl);

  const handleImport = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const recipe = await importRecipe({ url: url.trim() });
      onImport(recipe);
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-cream rounded-lg border border-cream-dark">
      <h3 className="font-medium mb-2">Import from URL</h3>
      <div className="flex gap-2">
        <label htmlFor="import-url" className="sr-only">
          Recipe URL
        </label>
        <input
          id="import-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleImport()}
          placeholder="https://example.com/recipe..."
          className="input-field flex-1 py-2 text-sm"
        />
        <button onClick={handleImport} disabled={loading || !url.trim()} className="btn-secondary text-sm">
          {loading ? "Importing…" : "Import"}
        </button>
      </div>
      {error && <p className="text-sm text-terracotta mt-2">{error}</p>}
      <p className="text-xs text-stone mt-2">Works with most recipe sites (AllRecipes, Food Network, etc.)</p>
    </div>
  );
}
