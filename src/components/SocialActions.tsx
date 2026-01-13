"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "./ui/toast";

interface Props {
  recipeId: Id<"recipes">;
  initialLiked: boolean;
  initialBookmarked: boolean;
  likesCount: number;
}

export function SocialActions({ recipeId, initialLiked, initialBookmarked, likesCount }: Props) {
  const { toast } = useToast();
  const toggleLike = useMutation(api.social.toggleLike);
  const toggleBookmark = useMutation(api.social.toggleBookmark);

  const [liked, setLiked] = useState(initialLiked);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [count, setCount] = useState(likesCount);

  const handleLike = async () => {
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    try {
      await toggleLike({ recipeId });
    } catch {
      setLiked(liked);
      setCount(count);
      toast("Sign in to like recipes", "error");
    }
  };

  const handleBookmark = async () => {
    setBookmarked(!bookmarked);
    try {
      await toggleBookmark({ recipeId });
      toast(bookmarked ? "Removed from saved" : "Saved!", "success");
    } catch {
      setBookmarked(bookmarked);
      toast("Sign in to save recipes", "error");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
          liked ? "bg-terracotta/10 border-terracotta/30 text-terracotta" : "bg-warm-white border-cream-dark text-charcoal-light hover:border-terracotta/30 hover:text-terracotta"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
        {count}
      </button>
      <button
        onClick={handleBookmark}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
          bookmarked ? "bg-sage/10 border-sage/30 text-sage" : "bg-warm-white border-cream-dark text-charcoal-light hover:border-sage/30 hover:text-sage"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        {bookmarked ? "Saved" : "Save"}
      </button>
    </div>
  );
}
