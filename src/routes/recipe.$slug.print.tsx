import { convexQuery } from "@convex-dev/react-query";
import { ClockIcon, FireIcon, PrinterIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { MetaStat } from "@/components/ui/MetaStat";

export const Route = createFileRoute("/recipe/$slug/print")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug })),
  component: PrintRecipe,
  pendingComponent: () => <div className="center min-h-screen text-stone animate-pulse">Loading…</div>,
  errorComponent: ({ error, reset }) => {
    // biome-ignore lint/suspicious/noConsole: log the real error for diagnostics
    console.error(error);
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-xl font-bold mb-4">Could not load recipe</h1>
        <p className="text-stone mb-4">Something went wrong while loading this recipe. Please try again.</p>
        <button type="button" onClick={() => reset()} className="btn-primary">
          Try again
        </button>
      </div>
    );
  },
});

function PrintRecipe() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));

  if (!recipe) throw notFound();

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <div className="max-w-2xl mx-auto p-8 print:p-0 bg-white min-h-screen">
      <style>{"@media print { body { -webkit-print-color-adjust: exact; } }"}</style>

      <header className="mb-8 pb-6 border-b-2 border-charcoal">
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        {recipe.description && <p className="text-stone">{recipe.description}</p>}
        <div className="flex flex-wrap gap-3 mt-4">
          {recipe.prepTime && (
            <MetaStat
              icon={ClockIcon}
              label="Prep"
              value={`${recipe.prepTime} min`}
              className="stat-box"
              iconClassName="w-4 h-4 text-stone"
              labelClassName="text-xs text-stone uppercase tracking-wide"
              valueClassName="text-sm font-medium text-charcoal"
            />
          )}
          {recipe.cookTime && (
            <MetaStat
              icon={FireIcon}
              label="Cook"
              value={`${recipe.cookTime} min`}
              className="stat-box"
              iconClassName="w-4 h-4 text-stone"
              labelClassName="text-xs text-stone uppercase tracking-wide"
              valueClassName="text-sm font-medium text-charcoal"
            />
          )}
          {totalTime > 0 && (
            <MetaStat
              icon={ClockIcon}
              label="Total"
              value={`${totalTime} min`}
              className="stat-box"
              iconClassName="w-4 h-4 text-stone"
              labelClassName="text-xs text-stone uppercase tracking-wide"
              valueClassName="text-sm font-medium text-charcoal"
            />
          )}
          {recipe.servings && (
            <MetaStat
              icon={UserGroupIcon}
              label="Serves"
              value={`${recipe.servings}`}
              className="stat-box"
              iconClassName="w-4 h-4 text-stone"
              labelClassName="text-xs text-stone uppercase tracking-wide"
              valueClassName="text-sm font-medium text-charcoal"
            />
          )}
          {recipe.difficulty && (
            <MetaStat
              icon={FireIcon}
              label="Difficulty"
              value={recipe.difficulty}
              className="stat-box"
              iconClassName="w-4 h-4 text-stone"
              labelClassName="text-xs text-stone uppercase tracking-wide"
              valueClassName="text-sm font-medium text-charcoal"
            />
          )}
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing) => (
            <li key={ing} className="flex items-start gap-2">
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
            <li key={step} className="flex gap-4">
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
        <button type="button" onClick={() => window.print()} className="btn-primary flex items-center gap-2">
          <PrinterIcon className="w-4 h-4" />
          Print Recipe
        </button>
      </div>
    </div>
  );
}
