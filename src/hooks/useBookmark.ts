import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/Toast";

export function useBookmark(recipeId: Id<"recipes">) {
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark);
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const isBookmarked = bookmarks?.some((b) => b._id === recipeId) ?? false;

  const handleToggle = useCallback(async () => {
    setIsPending(true);
    try {
      await toggleBookmarkMutation({ recipeId });
    } catch {
      toast("Sign in to save recipes", "error");
    } finally {
      setIsPending(false);
    }
  }, [recipeId, toggleBookmarkMutation, toast]);

  return { isBookmarked, isPending, handleToggle };
}
