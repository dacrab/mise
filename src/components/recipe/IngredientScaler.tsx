
import { useState, useMemo } from "react";

interface Props {
  ingredients: string[];
  defaultServings?: number;
}

export function IngredientScaler({ ingredients, defaultServings = 4 }: Props) {
  const [servings, setServings] = useState(defaultServings);
  const scale = servings / defaultServings;

  const scaledIngredients = useMemo(() => {
    return ingredients.map((ing) => {
      return ing.replace(/(\d+\/\d+|\d+\.?\d*)/g, (match) => {
        if (match.includes("/")) {
          const parts = match.split("/").map(Number);
          const num = parts[0] ?? 0;
          const den = parts[1] ?? 1;
          const scaled = (num / den) * scale;
          return formatNumber(scaled);
        }
        const scaled = parseFloat(match) * scale;
        return formatNumber(scaled);
      });
    });
  }, [ingredients, scale]);

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

function formatNumber(n: number): string {
  if (n === Math.floor(n)) return n.toString();
  
  const fractions: [number, string][] = [
    [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.66, "⅔"], [0.75, "¾"],
  ];
  
  const whole = Math.floor(n);
  const decimal = n - whole;
  
  for (const [val, symbol] of fractions) {
    if (Math.abs(decimal - val) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }
  
  return n.toFixed(1).replace(/\.0$/, "");
}
