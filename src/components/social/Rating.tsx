
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import type { Id } from "convex/_generated/dataModel";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

interface Props {
  recipeId: Id<"recipes">;
}

export function StarRating({ recipeId }: Props) {
  const stats = useQuery(api.ratings.getStats, { recipeId }) ?? { average: 0, count: 0, userRating: null };
  const rate = useMutation(api.ratings.rate);
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
            >
              {filled ? <StarSolidIcon className="w-5 h-5" /> : <StarIcon className="w-5 h-5" />}
            </button>
          );
        })}
      </div>
      <span className="text-sm text-stone">
        {stats.average > 0 ? `${stats.average.toFixed(1)} (${stats.count})` : "No ratings"}
      </span>
    </div>
  );
}

export function RatingDisplay({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-1 text-honey">
      <StarSolidIcon className="w-4 h-4" />
      <span className="text-sm font-medium text-charcoal">{average > 0 ? average.toFixed(1) : "-"}</span>
      {count > 0 && <span className="text-xs text-stone">({count})</span>}
    </div>
  );
}
