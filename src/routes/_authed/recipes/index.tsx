import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import { useState } from "react";
import { z } from "zod";
import { RecipeCard, RecipeGridSkeleton } from "@/components/ui/RecipeCard";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/constants";
import { filterRecipes } from "@/lib/search";

const searchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/_authed/recipes/")({
  validateSearch: searchSchema.parse,
  component: RecipesPage,
});

function RecipesPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate();
  const allRecipes = useQuery(api.recipes.list, {});
  const [query, setQuery] = useState("");

  if (allRecipes === undefined) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-8">
        <RecipeGridSkeleton />
      </div>
    );
  }

  const filtered = filterRecipes(
    allRecipes.filter((r) => !category || r.category === category),
    query,
  );

  const clearFilters = () => {
    setQuery("");
    navigate({ to: "/recipes", search: {} });
  };

  const isFiltered = !!query || !!category;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="py-8 md:py-12 mb-4">
        <h1 className="font-serif text-3xl md:text-4xl font-medium mb-2">Browse Recipes</h1>
        <p className="text-stone">Discover recipes from the community</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-minimal">
        <button
          type="button"
          onClick={() => navigate({ to: "/recipes", search: {} })}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
              : "bg-cream-dark dark:bg-d-surface-raised text-stone hover:text-charcoal dark:hover:text-d-text"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => navigate({ to: "/recipes", search: { category: category === c ? undefined : c } })}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c
                ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
                : "bg-cream-dark dark:bg-d-surface-raised text-stone hover:text-charcoal dark:hover:text-d-text"
            }`}
          >
            <span>{CATEGORY_ICONS[c]}</span>
            {c}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, ingredient, or category…"
          className="w-full pl-10 pr-4 py-2.5 card bg-transparent border-0 focus:outline-none text-primary placeholder:text-stone"
        />
      </div>

      {isFiltered && (
        <div className="mb-6 flex items-center gap-3 text-sm">
          <span className="text-stone">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            {query && (
              <>
                {" "}
                for "<span className="text-primary font-medium">{query}</span>"
              </>
            )}
            {category && (
              <>
                {" "}
                in <span className="text-primary font-medium">{category}</span>
              </>
            )}
          </span>
          <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-sage hover:underline">
            <XMarkIcon className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <RecipeCard
              key={r._id}
              slug={r.slug}
              recipeId={r._id}
              title={r.title}
              description={r.description}
              category={r.category}
              coverImageUrl={r.coverImageUrl}
            />
          ))}
        </div>
      ) : (
        <div className="card p-16 text-center">
          <p className="font-serif text-2xl font-medium text-primary mb-2">No recipes found</p>
          <p className="text-stone mb-6">{category ? `No ${category} recipes yet.` : "Try different keywords."}</p>
          <button type="button" onClick={clearFilters} className="btn-ghost">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
