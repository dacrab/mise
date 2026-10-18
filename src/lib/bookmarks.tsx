import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { createContext, useContext, useMemo } from "react";

type BookmarkedRecipes = FunctionReturnType<typeof api.recipes.myBookmarks>;

type BookmarksContextValue = {
  bookmarks: BookmarkedRecipes | undefined;
  bookmarkedIds: Set<Id<"recipes">>;
  toggle: (recipeId: Id<"recipes">) => Promise<unknown>;
};

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

// Fallback for anonymous visitors, who are rendered outside BookmarksProvider.
// `toggle` rejects so callers can still surface a "sign in to save" prompt.
const NO_PROVIDER: BookmarksContextValue = {
  bookmarks: undefined,
  bookmarkedIds: new Set(),
  toggle: () => Promise.reject(new Error("Not authenticated")),
};

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark);

  const value = useMemo<BookmarksContextValue>(
    () => ({
      bookmarks,
      bookmarkedIds: new Set(bookmarks?.map((b) => b._id)),
      toggle: (recipeId: Id<"recipes">) => toggleBookmarkMutation({ recipeId }),
    }),
    [bookmarks, toggleBookmarkMutation],
  );

  return <BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>;
}

export function useBookmarks() {
  return useContext(BookmarksContext) ?? NO_PROVIDER;
}
