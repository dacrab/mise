import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useOptimisticCounter, useOptimisticToggle, HeartIcon, BookmarkIcon } from "../lib";
import { withConvex } from "../convex";
import type { Id } from "../../convex/_generated/dataModel";

interface Props {
  recipeId: Id<"recipes">;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likesCount: number;
}

function SocialActionsInner({ recipeId, initialLiked, initialBookmarked, likesCount }: Props) {
  const toggleLikeMutation = useMutation(api.social.toggleLike);
  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark);

  const { count, active: liked, toggle: toggleLike } = useOptimisticCounter(
    likesCount,
    initialLiked,
    async () => {
      try {
        await toggleLikeMutation({ recipeId });
        return {};
      } catch (e) {
        return { error: e };
      }
    }
  );

  const [bookmarked, toggleBookmark] = useOptimisticToggle(
    initialBookmarked,
    async () => {
      try {
        await toggleBookmarkMutation({ recipeId });
        return {};
      } catch (e) {
        return { error: e };
      }
    }
  );

  const handleLike = async () => {
    const { error } = await toggleLike();
    if (error) alert("Please sign in to like recipes.");
  };

  const handleBookmark = async () => {
    const { error } = await toggleBookmark();
    if (error) alert("Please sign in to save recipes.");
  };

  return (
    <div className="flex items-center gap-4 py-6 border-t border-gray-100 mt-12">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
          liked
            ? "bg-red-50 border-red-200 text-red-600"
            : "bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600"
        }`}
      >
        <HeartIcon filled={liked} />
        <span className="font-bold">{count}</span>
      </button>
      <button
        onClick={handleBookmark}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
          bookmarked
            ? "bg-blue-50 border-blue-200 text-blue-600"
            : "bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600"
        }`}
      >
        <BookmarkIcon filled={bookmarked} />
        <span className="font-bold">{bookmarked ? "Saved" : "Save"}</span>
      </button>
    </div>
  );
}

export default withConvex(SocialActionsInner);
