import { useMutation, useQuery } from "convex/react";
import { useRouter } from "@tanstack/react-router";
import { BookmarkIcon, HeartIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useBookmarkToggle } from "@/hooks/useBookmarkToggle";
import { useConfirmAction } from "@/hooks/useConfirmAction";

function ForkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="18" r="2" />
      <path d="M6 8v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8" />
      <line x1="12" y1="14" x2="12" y2="16" />
    </svg>
  );
}

export function ForkButton({ recipeId, recipeTitle }: { recipeId: Id<"recipes">; recipeTitle: string }) {
  const fork = useMutation(api.recipes.fork);
  const router = useRouter();

  const { trigger, pendingId } = useConfirmAction<Id<"recipes">>(
    async (id) => {
      const result = await fork({ id });
      await router.navigate({ to: "/dashboard/edit/$id", params: { id: result.id } });
    },
    {
      confirmMessage: `Tap again to fork "${recipeTitle}" to your kitchen`,
      errorMessage: "Could not fork recipe",
    }
  );

  return (
    <button
      onClick={() => void trigger(recipeId)}
      className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-light hover:text-sage hover:bg-cream-dark rounded-lg transition-colors"
      title="Fork this recipe"
      aria-label="Fork this recipe into your kitchen"
    >
      <ForkIcon className="w-4 h-4" />
      {pendingId === recipeId ? "Confirm?" : "Fork"}
    </button>
  );
}

export function SocialActions({ recipeId, slug }: { recipeId: Id<"recipes">; slug: string }) {
  const recipe = useQuery(api.recipes.getBySlug, { slug });

  const toggleLikeMutation = useMutation(api.social.toggleLike).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.recipes.getBySlug, { slug });
    if (current) {
      localStore.setQuery(api.recipes.getBySlug, { slug }, {
        ...current,
        isLiked: !current.isLiked,
        likesCount: current.isLiked ? current.likesCount - 1 : current.likesCount + 1,
      });
    }
  });

  const { execute: handleLike, isPending: isLiking } = useAsyncAction(
    () => toggleLikeMutation({ recipeId }),
    { errorMessage: "Sign in to like recipes" }
  );
  const { isBookmarked, isPending: isBookmarking, toggleBookmark: handleBookmark } = useBookmarkToggle(recipeId, {
    errorMessage: "Sign in to save recipes",
  });

  const isLiked = recipe?.isLiked ?? false;
  const count = recipe?.likesCount ?? 0;

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Recipe actions">
      <button
        onClick={handleLike}
        disabled={isLiking}
        aria-label={isLiked ? `Unlike recipe (${count} likes)` : `Like recipe (${count} likes)`}
        aria-pressed={isLiked}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 ${isLiked ? "bg-terracotta/10 border-terracotta/30 text-terracotta" : "bg-warm-white border-cream-dark text-charcoal-light hover:border-terracotta/30 hover:text-terracotta"}`}
      >
        {isLiked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
        {count}
      </button>
      <button
        onClick={() => void handleBookmark()}
        disabled={isBookmarking}
        aria-label={isBookmarked ? "Remove from saved" : "Save recipe"}
        aria-pressed={isBookmarked}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-50 ${isBookmarked ? "bg-sage/10 border-sage/30 text-sage" : "bg-warm-white border-cream-dark text-charcoal-light hover:border-sage/30 hover:text-sage"}`}
      >
        {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
        {isBookmarked ? "Saved" : "Save"}
      </button>
    </div>
  );
}
