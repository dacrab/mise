import { CakeIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type { Id } from "convex/_generated/dataModel";
import { BookmarkButton } from "@/components/recipe/BookmarkButton";

export function RecipeCard({
  slug,
  recipeId,
  title,
  description,
  category,
  coverImageUrl,
}: {
  slug: string;
  recipeId?: Id<"recipes">;
  title: string;
  description?: string | null;
  category: string;
  coverImageUrl?: string | null;
}) {
  return (
    <Link to="/recipe/$slug" params={{ slug }} className="recipe-card group">
      <div className="relative overflow-hidden">
        {coverImageUrl ? (
          <img src={coverImageUrl} alt={title} className="recipe-card-image" />
        ) : (
          <div className="center aspect-[4/3] bg-cream-dark dark:bg-d-surface-raised">
            <RecipePlaceholder size={32} />
          </div>
        )}
        <span className="absolute top-3 left-3 tag bg-warm-white/90 dark:bg-d-surface/90 backdrop-blur-sm">
          {category}
        </span>
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {recipeId && (
            <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              <BookmarkButton recipeId={recipeId} variant="card" />
            </div>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors line-clamp-1">{title}</h3>
        {description && <p className="text-sm text-stone line-clamp-2 mt-1">{description}</p>}
      </div>
    </Link>
  );
}

export function FeaturedRecipeCard({
  slug,
  title,
  coverImageUrl,
  badge,
}: {
  slug: string;
  title: string;
  coverImageUrl?: string | null;
  badge?: string;
}) {
  return (
    <Link to="/recipe/$slug" params={{ slug }} className="group relative block">
      <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-cream-dark dark:bg-d-surface-raised">
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
      <div className="absolute bottom-4 left-4 right-4 bg-warm-white/95 dark:bg-d-surface/95 backdrop-blur-sm rounded-xl p-4 shadow-card">
        {badge && <span className="tag-sage text-[10px] mb-2">{badge}</span>}
        <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors">{title}</h3>
      </div>
    </Link>
  );
}

export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => {
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton with fixed count
          <div key={i} className="card overflow-hidden animate-pulse">
            <div className="w-full aspect-[4/3] bg-cream-dark dark:bg-d-surface-raised" />
            <div className="p-4 space-y-2">
              <div className="h-4 surface-raised rounded w-3/4" />
              <div className="h-3 surface-raised rounded w-1/2" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecipePlaceholder({ size }: { size: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-stone-light">
      <CakeIcon style={{ width: size, height: size }} />
    </div>
  );
}
