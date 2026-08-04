import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useBookmarks } from "@/lib/bookmarks";

type BookmarkButtonProps = {
  recipeId: Id<"recipes">;
  variant?: "card" | "page";
};

export function BookmarkButton({ recipeId, variant = "page" }: BookmarkButtonProps) {
  const currentUser = useQuery(api.users.currentUser);
  const { bookmarkedIds, toggle } = useBookmarks();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const isBookmarked = bookmarkedIds.has(recipeId);

  const handleToggle = useCallback(async () => {
    setIsPending(true);
    try {
      await toggle(recipeId);
    } catch {
      toast("Sign in to save recipes", "error");
    } finally {
      setIsPending(false);
    }
  }, [recipeId, toggle, toast]);

  if (variant === "card" && currentUser === null) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (variant === "card") {
      e.preventDefault();
      e.stopPropagation();
    }
    void handleToggle();
  };

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={isBookmarked ? "Remove from saved" : "Save recipe"}
        className={`p-2 rounded-full shadow-sm transition-all duration-200 backdrop-blur-sm disabled:opacity-50 ${
          isBookmarked ? "bg-charcoal/80 text-honey" : "bg-black/40 text-white hover:bg-charcoal/80"
        }`}
      >
        {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkOutlineIcon className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove from saved" : "Save recipe"}
      aria-pressed={isBookmarked}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isBookmarked
          ? "bg-sage/10 text-sage"
          : "bg-cream-dark hover:bg-sage/10 text-stone hover:text-sage dark:bg-d-surface-raised dark:hover:bg-sage/10"
      }`}
    >
      {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkOutlineIcon className="w-4 h-4" />}
      {isBookmarked ? "Saved" : "Save"}
    </button>
  );
}
