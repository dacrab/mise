import { useMemo, useState } from "react";
import { scaleIngredient } from "@/lib/utils";

export function IngredientScaler({
  ingredients,
  defaultServings = 4,
}: {
  ingredients: string[];
  defaultServings?: number;
}) {
  const [servings, setServings] = useState(defaultServings);
  const scale = servings / defaultServings;
  const scaled = useMemo(() => ingredients.map((ing) => scaleIngredient(ing, scale)), [ingredients, scale]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="servings-input" className="text-sm font-medium text-secondary">
          Servings:
        </label>
        <button
          onClick={() => setServings(Math.max(1, servings - 1))}
          className="w-8 h-8 rounded-lg surface-raised hover:bg-stone-light/50 dark:hover:bg-d-border flex items-center justify-center text-primary transition-colors"
          aria-label="Decrease servings"
        >
          −
        </button>
        <input
          id="servings-input"
          type="number"
          min={1}
          max={100}
          value={servings}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v) && v >= 1 && v <= 100) setServings(v);
          }}
          className="w-12 text-center font-medium text-primary bg-transparent border-b border-stone-light dark:border-d-border-strong focus:outline-none focus:border-sage"
          aria-label="Number of servings"
        />
        <button
          onClick={() => setServings(servings + 1)}
          className="w-8 h-8 rounded-lg surface-raised hover:bg-stone-light/50 dark:hover:bg-d-border flex items-center justify-center text-primary transition-colors"
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
        {scaled.map((ing, i) => (
          <li key={i} className="text-sm text-secondary flex gap-2">
            <span className="text-stone mt-0.5">·</span>
            <span>{ing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
