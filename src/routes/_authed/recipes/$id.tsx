import { convexQuery } from "@convex-dev/react-query";
import { PencilSquareIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { BookmarkButton } from "@/components/recipe/BookmarkButton";
import { Spinner } from "@/components/ui/Primitives";
import { RouteError } from "@/components/ui/RouteError";

export const Route = createFileRoute("/_authed/recipes/$id")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.recipes.getById, { id: params.id as Id<"recipes"> })),
  component: RecipeDetailPage,
  pendingComponent: () => (
    <div className="center min-h-[60vh]">
      <Spinner className="w-8 h-8 text-sage" />
    </div>
  ),
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
});

function RecipeDetailPage() {
  const { id } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getById, { id: id as Id<"recipes"> }));
  const currentUser = useQuery(api.users.currentUser);

  if (!recipe) throw notFound();

  const isOwner = currentUser?._id === recipe.userId;

  return (
    <article className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="font-hand text-xl text-sage mb-1">{recipe.category}</p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium">{recipe.title}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <BookmarkButton recipeId={recipe._id} />
          {isOwner && (
            <Link
              to="/dashboard/edit/$id"
              params={{ id: recipe._id }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-cream-dark hover:bg-sage/10 text-stone hover:text-sage dark:bg-d-surface-raised dark:hover:bg-sage/10 transition-all"
            >
              <PencilSquareIcon className="w-4 h-4" />
              Edit
            </Link>
          )}
        </div>
      </div>

      {recipe.coverImageUrl ? (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-cream-dark dark:bg-d-surface-raised mb-8">
          <img src={recipe.coverImageUrl} alt={recipe.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-video rounded-xl flex items-center justify-center bg-cream-dark dark:bg-d-surface-raised mb-8">
          <PhotoIcon className="w-12 h-12 text-stone-light" />
        </div>
      )}

      {recipe.description && (
        <p className="text-lg text-secondary leading-relaxed max-w-2xl mb-8">{recipe.description}</p>
      )}

      {(recipe.prepTime != null || recipe.cookTime != null || recipe.servings != null || recipe.difficulty) && (
        <div className="flex flex-wrap gap-6 py-4 px-6 rounded-xl surface-muted mb-8">
          {recipe.prepTime != null && (
            <div>
              <span className="text-xs text-stone block">Prep</span>
              <span className="font-medium">{recipe.prepTime}m</span>
            </div>
          )}
          {recipe.cookTime != null && (
            <div>
              <span className="text-xs text-stone block">Cook</span>
              <span className="font-medium">{recipe.cookTime}m</span>
            </div>
          )}
          {recipe.servings != null && (
            <div>
              <span className="text-xs text-stone block">Serves</span>
              <span className="font-medium">{recipe.servings}</span>
            </div>
          )}
          {recipe.difficulty && (
            <div>
              <span className="text-xs text-stone block">Level</span>
              <span className="font-medium">{recipe.difficulty}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-[340px_1fr] gap-10 lg:gap-14 pb-16">
        <aside>
          <div className="card p-6">
            <h2 className="font-serif text-xl font-medium mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient) => (
                <li key={ingredient} className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section>
          <h2 className="font-serif text-xl font-medium mb-6">Instructions</h2>
          <ol className="space-y-6">
            {recipe.steps.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="w-8 h-8 step-number text-sm shrink-0">{i + 1}</span>
                <p className="pt-1 text-charcoal-light dark:text-d-text-secondary leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
