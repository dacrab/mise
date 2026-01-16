
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAsyncAction } from "@/hooks";
import { ActionButton } from "@/components/ui/ActionButton";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

interface Props {
  recipeId: Id<"recipes">;
  slug: string;
}

export function SocialActions({ recipeId, slug }: Props) {
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

  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.recipes.getBySlug, { slug });
    if (current) {
      localStore.setQuery(api.recipes.getBySlug, { slug }, { ...current, isBookmarked: !current.isBookmarked });
    }
  });

  const { execute: handleLike, isPending: isLiking } = useAsyncAction(
    () => toggleLikeMutation({ recipeId }),
    { errorMessage: "Sign in to like recipes" }
  );

  const { execute: handleBookmark, isPending: isBookmarking } = useAsyncAction(
    async () => {
      const result = await toggleBookmarkMutation({ recipeId });
      return result;
    },
    { errorMessage: "Sign in to save recipes" }
  );

  const liked = recipe?.isLiked ?? false;
  const bookmarked = recipe?.isBookmarked ?? false;
  const count = recipe?.likesCount ?? 0;

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Recipe actions">
      <ActionButton
        onClick={handleLike}
        isActive={liked}
        isPending={isLiking}
        activeClass="bg-terracotta/10 border-terracotta/30 text-terracotta"
        inactiveClass="bg-warm-white border-cream-dark text-charcoal-light hover:border-terracotta/30 hover:text-terracotta"
        ariaLabel={liked ? `Unlike recipe (${count} likes)` : `Like recipe (${count} likes)`}
      >
        {liked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
        {count}
      </ActionButton>
      <ActionButton
        onClick={handleBookmark}
        isActive={bookmarked}
        isPending={isBookmarking}
        ariaLabel={bookmarked ? "Remove from saved" : "Save recipe"}
      >
        {bookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
        {bookmarked ? "Saved" : "Save"}
      </ActionButton>
    </div>
  );
}
