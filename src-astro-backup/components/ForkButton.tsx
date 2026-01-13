import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

interface Props {
  recipeId: Id<"recipes">;
  recipeTitle: string;
}

export function ForkButton({ recipeId, recipeTitle }: Props) {
  const fork = useMutation(api.recipes.fork);

  const handleFork = async () => {
    if (!confirm(`Fork "${recipeTitle}" to your kitchen?`)) return;
    const result = await fork({ id: recipeId });
    window.location.href = `/dashboard/edit/${result.id}`;
  };

  return (
    <button
      onClick={handleFork}
      className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-light hover:text-sage hover:bg-cream-dark rounded-lg transition-colors"
      title="Fork this recipe"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/>
        <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/>
      </svg>
      Fork
    </button>
  );
}
