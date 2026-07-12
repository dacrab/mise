import type { Id } from "convex/_generated/dataModel";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useBookmarks } from "@/lib/bookmarks";

export function useBookmark(recipeId: Id<"recipes">) {
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

  return { isBookmarked, isPending, handleToggle };
}
