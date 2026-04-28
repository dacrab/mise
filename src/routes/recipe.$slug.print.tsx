import { convexQuery } from "@convex-dev/react-query";
import { ClockIcon, FireIcon, UserGroupIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

export const Route = createFileRoute("/recipe/$slug/print")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug })),
  component: PrintRecipe,
});

function PrintRecipe() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));

  if (!recipe) throw notFound();

  return (
    <div className="max-w-2xl mx-auto p-8 print:p-0 bg-white min-h-screen">
      <style>{`@media print { body { -webkit-print-color-adjust: exact; } }`}</style>

      <header className="mb-8 pb-6 border-b-2 border-charcoal">
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        {recipe.description && <p className="text-stone">{recipe.description}</p>}
        <div className="flex flex-wrap gap-3 mt-4">
          {recipe.prepTime && (
            <div className="stat-box">
              <div className="text-stone">
                <ClockIcon className="w-4 h-4" />
              </div>
              <span className="text-xs text-stone uppercase tracking-wide">Prep</span>
              <span className="text-sm font-medium text-charcoal">{recipe.prepTime} min</span>
            </div>
          )}
          {recipe.cookTime && (
            <div className="stat-box">
              <div className="text-stone">
                <FireIcon className="w-4 h-4" />
              </div>
              <span className="text-xs text-stone uppercase tracking-wide">Cook</span>
              <span className="text-sm font-medium text-charcoal">{recipe.cookTime} min</span>
            </div>
          )}
          {recipe.prepTime && recipe.cookTime && (
            <div className="stat-box">
              <div className="text-stone">
                <ClockIcon className="w-4 h-4" />
              </div>
              <span className="text-xs text-stone uppercase tracking-wide">Total</span>
              <span className="text-sm font-medium text-charcoal">{recipe.prepTime + recipe.cookTime} min</span>
            </div>
          )}
          {recipe.servings && (
            <div className="stat-box">
              <div className="text-stone">
                <UserGroupIcon className="w-4 h-4" />
              </div>
              <span className="text-xs text-stone uppercase tracking-wide">Serves</span>
              <span className="text-sm font-medium text-charcoal">{recipe.servings}</span>
            </div>
          )}
          {recipe.difficulty && (
            <div className="stat-box">
              <div className="text-stone">
                <FireIcon className="w-4 h-4" />
              </div>
              <span className="text-xs text-stone uppercase tracking-wide">Difficulty</span>
              <span className="text-sm font-medium text-charcoal">{recipe.difficulty}</span>
            </div>
          )}
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="inline-block w-4 h-4 mt-0.5 border border-charcoal rounded-sm flex-shrink-0" />
              {ing}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="space-y-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-bold text-sage">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-12 pt-4 border-t text-sm text-stone text-center print:mt-8">
        Recipe from Mise • mise.cooking
      </footer>

      <div className="mt-8 print:hidden">
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <PrinterIcon className="w-4 h-4" />
          Print Recipe
        </button>
      </div>
    </div>
  );
}
