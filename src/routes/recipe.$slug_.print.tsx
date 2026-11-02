import { convexQuery } from "@convex-dev/react-query";
import { PrinterIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { MetaStat } from "@/components/ui/MetaStat";
import { LoadingState } from "@/components/ui/Primitives";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { recipeStats } from "@/lib/recipe";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/recipe/$slug_/print")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug })),
  component: PrintRecipe,
  pendingComponent: LoadingState,
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="text-2xl font-medium">Could not load recipe</h1>
      <p className="mt-3 text-ink-soft">Something went wrong while loading this recipe.</p>
      <button type="button" onClick={reset} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Print${APP_TITLE_SUFFIX}` : `Print${APP_TITLE_SUFFIX}` },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PrintRecipe() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));

  if (!recipe) throw notFound();

  const stats = recipeStats(recipe);

  return (
    <div className="mx-auto max-w-2xl bg-white px-6 py-10 text-black print:max-w-none print:p-0">
      <header className="border-b-2 border-black pb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">Mise · mise.cooking</p>
        <h1 className="mt-2 text-3xl font-medium leading-tight">{recipe.title}</h1>
        {recipe.description && <p className="mt-2 text-sm leading-relaxed text-neutral-600">{recipe.description}</p>}
        {stats.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-5">
            {stats.map((stat) => (
              <MetaStat key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} compact />
            ))}
          </div>
        )}
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Ingredients</h2>
        <ul className="mt-4 space-y-2.5">
          {recipe.ingredients.map((ingredient, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: ingredients may repeat, so the value alone is not unique
            <li key={`${ingredient}-${index}`} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 inline-block size-4 shrink-0 rounded-sm border border-neutral-400" />
              <span>{ingredient}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Instructions</h2>
        <ol className="mt-4 space-y-4">
          {recipe.steps.map((step, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: steps may repeat, so the value alone is not unique
            <li key={`${step}-${index}`} className="flex gap-4 text-sm">
              <span className="font-semibold text-neutral-500">{index + 1}.</span>
              <span className="leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-10 border-t border-neutral-300 pt-4 text-center text-xs text-neutral-500">
        Shared on Mise · {formatDate(recipe._creationTime)}
      </footer>

      <div className="mt-8 print:hidden">
        <button type="button" onClick={() => window.print()} className="btn-primary">
          <PrinterIcon className="size-4" />
          Print recipe
        </button>
      </div>
    </div>
  );
}
