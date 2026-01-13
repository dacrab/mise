import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function TrendingRecipes() {
  const recipes = useQuery(api.discovery.trending, { limit: 6 }) ?? [];

  if (recipes.length === 0) return null;

  return (
    <section>
      <h2 className="font-serif text-2xl font-medium mb-6">Trending this week</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map((recipe, i) => (
          <a key={recipe._id} href={`/recipe/${recipe.slug}`} className="recipe-card group">
            <div className="relative overflow-hidden">
              {i < 3 && (
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-charcoal text-cream flex items-center justify-center text-sm font-medium z-10">
                  {i + 1}
                </div>
              )}
              {recipe.coverImageUrl ? (
                <img src={recipe.coverImageUrl} alt={recipe.title} className="recipe-card-image" />
              ) : (
                <div className="aspect-[4/3] bg-cream-dark" />
              )}
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors">{recipe.title}</h3>
              <span className="text-xs text-stone">{recipe.trendingScore} likes this week</span>
            </div>
          </a>
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
        {recipes.map((recipe) => (
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
    </section>
  );
}
