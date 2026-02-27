import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { useCallback, useState } from "react";
import type { Id } from "convex/_generated/dataModel";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

export function QuickBookmark({ recipeId }: { recipeId: Id<"recipes"> }) {
  const currentUser = useQuery(api.users.currentUser);
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const toggleBookmark = useMutation(api.social.toggleBookmark);
  const [pending, setPending] = useState(false);

  const isBookmarked = bookmarks?.some((r) => r !== null && r._id === recipeId) ?? false;

  const handleClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser || pending) return;
    setPending(true);
    try { await toggleBookmark({ recipeId, collectionId: undefined }); }
    finally { setPending(false); }
  }, [currentUser, pending, recipeId, toggleBookmark]);

  if (currentUser === null) return null;

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      aria-label={isBookmarked ? "Remove from saved" : "Save recipe"}
      className={`p-2 rounded-full shadow-sm transition-all duration-200 backdrop-blur-sm disabled:opacity-50 ${isBookmarked ? "bg-charcoal/80 text-honey" : "bg-black/40 text-white hover:bg-charcoal/80"}`}
    >
      {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
    </button>
  );
}
