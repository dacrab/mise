import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { config } from "../config";

export function AdvancedSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [ingredient, setIngredient] = useState("");

  const results = useQuery(api.discovery.search, {
    query: query || undefined,
    category: category || undefined,
    ingredient: ingredient || undefined,
    limit: 20,
  });

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes..."
          className="input-field sm:col-span-2"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          <option value="">All categories</option>
          {config.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {results === undefined ? (
        <p className="text-center text-stone py-12">Loading...</p>
      ) : results.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-stone">No recipes found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((recipe) => (
            <a key={recipe._id} href={`/recipe/${recipe.slug}`} className="recipe-card group">
              <div className="relative overflow-hidden">
                {recipe.coverImageUrl ? (
                  <img src={recipe.coverImageUrl} alt={recipe.title} className="recipe-card-image" />
                ) : (
                  <div className="aspect-[4/3] bg-cream-dark" />
                )}
                <span className="absolute top-3 left-3 tag bg-warm-white/90 backdrop-blur-sm">{recipe.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors">{recipe.title}</h3>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
