import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PrinterIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/recipe/$slug/print")({
  component: PrintRecipe,
});

function PrintRecipe() {
  const { slug } = Route.useParams();
  const recipe = useQuery(api.recipes.getBySlug, { slug });

  if (recipe === undefined) {
    return (
      <div className="max-w-2xl mx-auto p-8 animate-pulse">
        <div className="h-8 w-3/4 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-full bg-gray-200 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 rounded mb-8" />
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded mb-2" />)}
        <div className="h-6 w-32 bg-gray-200 rounded mt-8 mb-4" />
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-4 bg-gray-200 rounded mb-3" />)}
      </div>
    );
  }

  if (!recipe) throw notFound();

  return (
    <div className="max-w-2xl mx-auto p-8 print:p-0 bg-white min-h-screen">
      <style>{`@media print { body { -webkit-print-color-adjust: exact; } }`}</style>
      
      <header className="mb-8 pb-6 border-b-2 border-charcoal">
        <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
        {recipe.description && <p className="text-stone">{recipe.description}</p>}
        <div className="flex gap-6 mt-4 text-sm text-stone">
          {recipe.prepTime && <span>Prep: {recipe.prepTime} min</span>}
          {recipe.cookTime && <span>Cook: {recipe.cookTime} min</span>}
          {recipe.prepTime && recipe.cookTime && <span>Total: {recipe.prepTime + recipe.cookTime} min</span>}
          {recipe.servings && <span>Serves: {recipe.servings}</span>}
          {recipe.difficulty && <span>Difficulty: {recipe.difficulty}</span>}
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
