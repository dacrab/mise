import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function StarRating({ recipeId }: { recipeId: Id<"recipes"> }) {
  const stats = useQuery(api.social.ratingStats, { recipeId }) ?? { average: 0, count: 0, userRating: null };
  const rate = useMutation(api.social.rateRecipe);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hover || stats.userRating || 0) >= star;
          return (
            <button
              key={star}
              onClick={() => rate({ recipeId, value: star })}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-0.5 text-honey transition-colors"
              aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
            >
              {filled ? <StarSolidIcon className="w-5 h-5" /> : <StarIcon className="w-5 h-5" />}
            </button>
          );
        })}
      </div>
      {stats.count > 0 && (
        <span className="text-sm text-stone">{stats.average} ({stats.count})</span>
      )}
    </div>
  );
}
