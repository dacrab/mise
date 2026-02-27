import { Link } from "@tanstack/react-router";
import { CakeIcon } from "@heroicons/react/24/outline";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import { api } from "convex/_generated/api";

function QuickBookmark({ recipeId }: { recipeId: Id<"recipes"> }) {
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

interface RecipeCardProps {
  slug: string;
  recipeId?: Id<"recipes">;
  title: string;
  description?: string | null;
  category: string;
  coverImageUrl?: string | null;
  variant?: "grid" | "list" | "featured";
  badge?: string;
  meta?: React.ReactNode;
}

export function RecipeCard({
  slug,
  recipeId,
  title,
  description,
  category,
  coverImageUrl,
  variant = "grid",
  badge,
  meta,
}: RecipeCardProps) {
  if (variant === "list") {
    return (
      <div className="group flex gap-4 p-3 -m-3 rounded-xl hover:bg-warm-white transition-colors relative">
        <Link
          to="/recipe/$slug"
          params={{ slug }}
          className="flex gap-4 flex-1 min-w-0"
        >
          <div className="w-24 h-24 rounded-lg overflow-hidden bg-cream-dark shrink-0">
            {coverImageUrl ? (
              <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <RecipePlaceholder size={24} />
            )}
          </div>
          <div className="flex-1 min-w-0 py-1">
            <span className="text-[11px] text-stone uppercase tracking-wide">{category}</span>
            <h3 className="font-serif text-base font-medium mt-0.5 mb-1 group-hover:text-sage transition-colors line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-stone line-clamp-2">{description || "A delicious recipe."}</p>
          </div>
        </Link>
        {recipeId && (
          <div className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
            <QuickBookmark recipeId={recipeId} />
          </div>
        )}
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <Link to="/recipe/$slug" params={{ slug }} className="group relative block">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-cream-dark">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <RecipePlaceholder size={64} />
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4 bg-warm-white/95 backdrop-blur-sm rounded-xl p-4 shadow-card">
          {badge && <span className="tag-sage text-[10px] mb-2">{badge}</span>}
          <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors">{title}</h3>
        </div>
      </Link>
    );
  }

  // Default grid variant
  return (
    <Link to="/recipe/$slug" params={{ slug }} className="recipe-card group">
      <div className="relative overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={title} className="recipe-card-image" />
        ) : (
          <div className="aspect-[4/3] bg-cream-dark flex items-center justify-center">
            <RecipePlaceholder size={32} />
          </div>
        )}
        <span className="absolute top-3 left-3 tag bg-warm-white/90 backdrop-blur-sm">{category}</span>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {badge && (
            <div className="w-7 h-7 rounded-full bg-charcoal text-cream flex items-center justify-center text-sm font-medium">
              {badge}
            </div>
          )}
          {recipeId && (
            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              <QuickBookmark recipeId={recipeId} />
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors line-clamp-1">{title}</h3>
        {description && <p className="text-sm text-stone line-clamp-2 mt-1">{description}</p>}
        {meta}
      </div>
    </Link>
  );
}

export function RecipePlaceholder({ size }: { size: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-stone-light">
      <CakeIcon style={{ width: size, height: size }} />
    </div>
  );
}
