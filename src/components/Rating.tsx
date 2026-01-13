"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useState } from "react";
import type { Id } from "convex/_generated/dataModel";

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
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => rate({ recipeId, value: star })}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={(hover || stats.userRating || 0) >= star ? "#D4A853" : "none"}
              stroke="#D4A853"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm text-stone">
        {stats.average > 0 ? `${stats.average.toFixed(1)} (${stats.count})` : "No ratings"}
      </span>
    </div>
  );
}

export function RatingDisplay({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#D4A853" stroke="#D4A853" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span className="text-sm font-medium text-charcoal">{average > 0 ? average.toFixed(1) : "-"}</span>
      {count > 0 && <span className="text-xs text-stone">({count})</span>}
    </div>
  );
}
