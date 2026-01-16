
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { ShareIcon } from "@heroicons/react/24/outline";

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
      <ShareIcon className="w-4 h-4" />
      Fork
    </button>
  );
}
