import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { RecipeCard } from "@/components/ui/RecipeCard";

export function RelatedRecipes({ recipeId }: { recipeId: Id<"recipes"> }) {
  const related = useQuery(api.discovery.recommendations, { limit: 4 });
  const filtered = related?.filter((r) => r._id !== recipeId).slice(0, 3);
  if (!filtered || filtered.length === 0) return null;
  return (
    <section className="wrapper max-w-4xl pb-16">
      <h2 className="font-serif text-2xl font-medium mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <RecipeCard key={r._id} recipeId={r._id} slug={r.slug} title={r.title} category={r.category} coverImageUrl={r.coverImageUrl} />
        ))}
      </div>
    </section>
  );
}
