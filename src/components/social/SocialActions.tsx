import { useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "@/components/ui/toast";

type AsyncFunction = (...args: never[]) => Promise<unknown>;

function useAsyncAction<T extends AsyncFunction>(
  action: T,
  options?: {
    onSuccess?: (result: Awaited<ReturnType<T>>) => void;
    onError?: (error: Error) => void;
    successMessage?: string;
    errorMessage?: string;
  }
) {
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  // Keep latest action + options in a ref so the execute callback never
  // needs to be recreated when they change, avoiding infinite re-render loops
  // that would occur if `action` (a new function reference each render) were
  // listed as a dependency of useCallback.
  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      if (isPending) return undefined;
      setIsPending(true);
      try {
        const result = await (actionRef.current as (...args: Parameters<T>) => Promise<unknown>)(...args);
        const opts = optionsRef.current;
        if (opts?.successMessage) toast(opts.successMessage, "success");
        opts?.onSuccess?.(result as Awaited<ReturnType<T>>);
        return result as Awaited<ReturnType<T>>;
      } catch (e) {
        const error = e instanceof Error ? e : new Error("An error occurred");
        const opts = optionsRef.current;
        toast(opts?.errorMessage || error.message, "error");
        opts?.onError?.(error);
        return undefined;
      } finally {
        setIsPending(false);
      }
    },
    [isPending, toast] // intentionally omit action/options — they live in refs
  );

  return { execute, isPending };
}

interface ActionButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isPending?: boolean;
  activeClass?: string;
  inactiveClass?: string;
  children: React.ReactNode;
  ariaLabel: string;
  disabled?: boolean;
}

function ActionButton({ onClick, isActive = false, isPending = false, activeClass = "bg-sage/10 border-sage/30 text-sage", inactiveClass = "bg-warm-white border-cream-dark text-charcoal-light hover:border-sage/30 hover:text-sage", children, ariaLabel, disabled = false }: ActionButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled || isPending} aria-label={ariaLabel} aria-pressed={isActive}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isActive ? activeClass : inactiveClass} ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
}
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { HeartIcon, BookmarkIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/ui/Spinner";
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon, StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import { StarIcon } from "@heroicons/react/24/outline";

export function FollowButton({ userId }: { userId: Id<"users"> }) {
  const isFollowing = useQuery(api.social.isFollowing, { userId });
  const toggle = useMutation(api.social.toggleFollow);
  const [pending, setPending] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setPending(true);
    try { await toggle({ userId }); }
    catch { toast("Could not update follow", "error"); }
    finally { setPending(false); }
  };

  if (isFollowing === undefined) {
    return <div className="h-9 w-24 rounded-lg bg-cream-dark animate-pulse" aria-hidden="true" />;
  }

  return (
    <button
      onClick={() => void handleClick()}
      disabled={pending}
      aria-label={isFollowing ? "Unfollow this chef" : "Follow this chef"}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${isFollowing ? "bg-cream-dark text-charcoal-light hover:bg-stone-light/50" : "bg-charcoal text-cream hover:bg-charcoal-light"}`}
    >
      {pending && <Spinner className="w-3.5 h-3.5" />}
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

// Simple fork/branch SVG icon (no heroicons equivalent)
function ForkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="6" cy="6" r="2" /><circle cx="18" cy="6" r="2" /><circle cx="12" cy="18" r="2" />
      <path d="M6 8v2a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4V8" /><line x1="12" y1="14" x2="12" y2="16" />
    </svg>
  );
}

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
    <button onClick={handleFork} disabled={pending} className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal-light hover:text-sage hover:bg-cream-dark rounded-lg transition-colors disabled:opacity-50" title="Fork this recipe" aria-label="Fork this recipe into your kitchen">
      <ForkIcon className="w-4 h-4" />
      {pending ? "Forking…" : (confirming ? "Confirm?" : "Fork")}
    </button>
  );
}

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
