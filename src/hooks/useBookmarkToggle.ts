import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface BookmarkToggleOptions {
  errorMessage?: string;
  getErrorMessage?: (error: Error) => string;
  onError?: (error: Error) => void;
  onErrorMessage?: (message: string, error: Error) => void;
}

export function useBookmarkToggle(recipeId: Id<"recipes">, options?: BookmarkToggleOptions) {
  const currentUser = useQuery(api.users.currentUser);
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark);

  const isBookmarked = bookmarks?.some((recipe) => recipe._id === recipeId) ?? false;

  const { execute: toggleBookmark, isPending } = useAsyncAction(
    (collectionId?: Id<"collections">) => toggleBookmarkMutation({ recipeId, collectionId }),
    options
  );

  return { currentUser, isBookmarked, isPending, toggleBookmark };
}
