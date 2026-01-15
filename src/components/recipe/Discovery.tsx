import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { RecipeCard } from "@/components/ui/RecipeCard";

export function TrendingRecipes() {
  const recipes = useQuery(api.discovery.trending, { limit: 6 }) ?? [];
  if (recipes.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-medium mb-6">Trending this week</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, i) => (
          <RecipeCard
            key={recipe._id}
            slug={recipe.slug}
            title={recipe.title}
            category={recipe.category}
            coverImageUrl={recipe.coverImageUrl}
            badge={i < 3 ? String(i + 1) : undefined}
            meta={<span className="text-xs text-stone">{recipe.trendingScore} likes this week</span>}
          />
        ))}
      </div>
    </section>
  );
}

export function RecommendedRecipes() {
  const recipes = useQuery(api.discovery.recommendations, { limit: 6 }) ?? [];
  if (recipes.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-medium mb-6">Recommended for you</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => {
          const imageUrl = "coverImageUrl" in recipe ? (recipe as { coverImageUrl: string | null }).coverImageUrl : null;
          return (
            <RecipeCard
              key={recipe._id}
              slug={recipe.slug}
              title={recipe.title}
              category={recipe.category}
              coverImageUrl={imageUrl}
            />
          );
        })}
      </div>
    </section>
  );
}
