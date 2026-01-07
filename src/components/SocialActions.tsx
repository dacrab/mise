import { actions } from 'astro:actions';
import { useOptimisticCounter, useOptimisticToggle, HeartIcon, BookmarkIcon } from '@/lib';

interface Props {
  recipeId: string;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likesCount: number;
}

export default function SocialActions({ recipeId, initialLiked, initialBookmarked, likesCount }: Props) {
  const { count, active: liked, toggle: toggleLike } = useOptimisticCounter(
    likesCount, initialLiked, () => actions.toggleLike({ recipeId })
  );
  const [bookmarked, toggleBookmark] = useOptimisticToggle(
    initialBookmarked, () => actions.toggleBookmark({ recipeId })
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
      <button onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600'}`}>
        <HeartIcon filled={liked} />
        <span className="font-bold">{count}</span>
      </button>
      <button onClick={handleBookmark}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${bookmarked ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-200 hover:text-blue-600'}`}>
        <BookmarkIcon filled={bookmarked} />
        <span className="font-bold">{bookmarked ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
