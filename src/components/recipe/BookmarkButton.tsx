import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import type { Id } from "convex/_generated/dataModel";
import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useBookmarks } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

export function BookmarkButton({ recipeId, variant = "page" }: { recipeId: Id<"recipes">; variant?: "card" | "page" }) {
  const { isAuthenticated } = useConvexAuth();
  const { bookmarkedIds, toggle } = useBookmarks();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const isBookmarked = bookmarkedIds.has(recipeId);
  const label = isBookmarked ? "Remove from saved" : "Save recipe";
  const Icon = isBookmarked ? BookmarkSolidIcon : BookmarkOutlineIcon;

  const handleToggle = async () => {
    setIsPending(true);
    try {
      await toggle(recipeId);
    } catch {
      toast(isAuthenticated ? "Could not save bookmark" : "Sign in to save recipes", "error");
    } finally {
      setIsPending(false);
    }
  };

  if (variant === "card") {
    if (!isAuthenticated) return null;
    return (
      <button
        type="button"
        onClick={() => void handleToggle()}
        disabled={isPending}
        aria-label={label}
        aria-pressed={isBookmarked}
        className={cn(
          "flex size-9 items-center justify-center rounded-full shadow-soft backdrop-blur-sm transition-colors disabled:opacity-50",
          isBookmarked ? "bg-surface text-accent" : "bg-black/35 text-white hover:bg-black/55",
        )}
      >
        <Icon className="size-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void handleToggle()}
      disabled={isPending}
      aria-label={label}
      aria-pressed={isBookmarked}
      className={cn(
        "btn btn-sm border",
        isBookmarked
          ? "border-accent/20 bg-accent-soft text-accent"
          : "border-line bg-surface text-ink-soft hover:text-ink",
      )}
    >
      <Icon className="size-4" />
      {isBookmarked ? "Saved" : "Save"}
    </button>
  );
}
