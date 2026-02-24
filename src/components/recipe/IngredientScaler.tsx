
import { useState, useMemo } from "react";
import { scaleIngredient } from "@/lib/recipe";

interface Props {
  ingredients: string[];
  defaultServings?: number;
}

export function IngredientScaler({ ingredients, defaultServings = 4 }: Props) {
  const [servings, setServings] = useState(defaultServings);
  const scale = servings / defaultServings;
  const scaledIngredients = useMemo(() => ingredients.map((ing) => scaleIngredient(ing, scale)), [ingredients, scale]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm font-medium text-charcoal-light">Servings:</span>
        <button
          onClick={() => setServings(Math.max(1, servings - 1))}
          className="w-8 h-8 rounded-lg bg-cream-dark hover:bg-stone-light/50 flex items-center justify-center text-charcoal transition-colors"
          aria-label="Decrease servings"
        >
          −
        </button>
        <span className="w-8 text-center font-medium text-charcoal">{servings}</span>
        <button
          onClick={() => setServings(servings + 1)}
          className="w-8 h-8 rounded-lg bg-cream-dark hover:bg-stone-light/50 flex items-center justify-center text-charcoal transition-colors"
          aria-label="Increase servings"
        >
          +
        </button>
        {servings !== defaultServings && (
          <button onClick={() => setServings(defaultServings)} className="text-xs text-sage hover:text-sage-light">
            Reset
          </button>
        )}
      </div>

      <ul className="space-y-2">
        {scaledIngredients.map((ing, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-charcoal-light">
            <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0" />
            <span>{ing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

