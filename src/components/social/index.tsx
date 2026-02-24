import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "@/components/ui/toast";
import { useAsyncAction } from "@/hooks";
import { ActionButton } from "@/components/ui/Layout";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { HeartIcon, BookmarkIcon, ShareIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";

// ─── FollowButton ─────────────────────────────────────────────────────────────

export function FollowButton({ userId }: { userId: Id<"users"> }) {
  const isFollowing = useQuery(api.social.isFollowing, { userId }) ?? false;
  const toggle = useMutation(api.social.toggleFollow);
  return (
    <button
      onClick={() => toggle({ userId })}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isFollowing ? "bg-cream-dark text-charcoal-light hover:bg-stone-light/50" : "bg-charcoal text-cream hover:bg-charcoal-light"}`}
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export function FollowStats({ userId }: { userId: Id<"users"> }) {
  const counts = useQuery(api.social.followCounts, { userId }) ?? { followers: 0, following: 0 };
  return (
    <div className="flex gap-4 text-sm text-charcoal-light">
      <span><strong className="text-charcoal">{counts.followers}</strong> followers</span>
      <span><strong className="text-charcoal">{counts.following}</strong> following</span>
    </div>
  );
}

// ─── ForkButton ───────────────────────────────────────────────────────────────

export function ForkButton({ recipeId, recipeTitle }: { recipeId: Id<"recipes">; recipeTitle: string }) {
  const fork = useMutation(api.recipes.fork);
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleFork = async () => {
    if (!confirming) {
      setConfirming(true);
      toast(`Tap again to fork "${recipeTitle}" to your kitchen`, "info");
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setConfirming(false); setPending(true);
    try {
      const result = await fork({ id: recipeId });
      await router.navigate({ to: "/dashboard/edit/$id", params: { id: result.id } });
    } catch { toast("Could not fork recipe", "error"); }
    finally { setPending(false); }
  };

  return (
    <button onClick={handleFork} disabled={pending} className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-light hover:text-sage hover:bg-cream-dark rounded-lg transition-colors disabled:opacity-50" title="Fork this recipe">
      <ShareIcon className="w-4 h-4" />
      {pending ? "Forking…" : (confirming ? "Confirm?" : "Fork")}
    </button>
  );
}

// ─── StarRating ───────────────────────────────────────────────────────────────

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
            <button key={star} onClick={() => rate({ recipeId, value: star })} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)} className="p-0.5 text-honey transition-colors">
              {filled ? <StarSolidIcon className="w-5 h-5" /> : <StarIcon className="w-5 h-5" />}
            </button>
          );
        })}
      </div>
      {stats.count > 0 && <span className="text-sm text-stone">{stats.average} ({stats.count})</span>}
    </div>
  );
}

// ─── SocialActions ────────────────────────────────────────────────────────────

export function SocialActions({ recipeId, slug }: { recipeId: Id<"recipes">; slug: string }) {
  const recipe = useQuery(api.recipes.getBySlug, { slug });

  const toggleLikeMutation = useMutation(api.social.toggleLike).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.recipes.getBySlug, { slug });
    if (current) localStore.setQuery(api.recipes.getBySlug, { slug }, { ...current, isLiked: !current.isLiked, likesCount: current.isLiked ? current.likesCount - 1 : current.likesCount + 1 });
  });

  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark).withOptimisticUpdate((localStore) => {
    const current = localStore.getQuery(api.recipes.getBySlug, { slug });
    if (current) localStore.setQuery(api.recipes.getBySlug, { slug }, { ...current, isBookmarked: !current.isBookmarked });
  });

  const { execute: handleLike, isPending: isLiking } = useAsyncAction(
    () => toggleLikeMutation({ recipeId }),
    { errorMessage: "Sign in to like recipes" }
  );
  const { execute: handleBookmark, isPending: isBookmarking } = useAsyncAction(
    () => toggleBookmarkMutation({ recipeId }),
    { errorMessage: "Sign in to save recipes" }
  );

  const liked = recipe?.isLiked ?? false;
  const bookmarked = recipe?.isBookmarked ?? false;
  const count = recipe?.likesCount ?? 0;

  return (
    <div className="flex items-center gap-3" role="group" aria-label="Recipe actions">
      <ActionButton onClick={handleLike} isActive={liked} isPending={isLiking} activeClass="bg-terracotta/10 border-terracotta/30 text-terracotta" inactiveClass="bg-warm-white border-cream-dark text-charcoal-light hover:border-terracotta/30 hover:text-terracotta" ariaLabel={liked ? `Unlike recipe (${count} likes)` : `Like recipe (${count} likes)`}>
        {liked ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
        {count}
      </ActionButton>
      <ActionButton onClick={handleBookmark} isActive={bookmarked} isPending={isBookmarking} ariaLabel={bookmarked ? "Remove from saved" : "Save recipe"}>
        {bookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
        {bookmarked ? "Saved" : "Save"}
      </ActionButton>
    </div>
  );
}
