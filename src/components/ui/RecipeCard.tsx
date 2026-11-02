import { PhotoIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import type { Id } from "convex/_generated/dataModel";
import { memo } from "react";
import { BookmarkButton } from "@/components/recipe/BookmarkButton";

export type RecipeSummary = {
  _id: Id<"recipes">;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  coverImageUrl?: string | null;
};

export const RecipeCard = memo(function RecipeCard({
  recipe,
  priority = false,
}: {
  recipe: RecipeSummary;
  priority?: boolean;
}) {
  return (
    <article className="group relative">
      <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2">
          {recipe.coverImageUrl ? (
            <img
              src={recipe.coverImageUrl}
              alt={recipe.title}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <RecipePlaceholder />
          )}
        </div>
        <div className="mt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">{recipe.category}</p>
          <h3 className="mt-1.5 font-display text-lg font-medium leading-snug transition-colors group-hover:text-accent">
            {recipe.title}
          </h3>
          {recipe.description && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-soft">{recipe.description}</p>
          )}
        </div>
      </Link>
      <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100">
        <BookmarkButton recipeId={recipe._id} variant="card" />
      </div>
    </article>
  );
});

export const FeaturedRecipeCard = memo(function FeaturedRecipeCard({
  recipe,
  badge,
}: {
  recipe: RecipeSummary;
  badge?: string;
}) {
  if (!recipe.coverImageUrl) {
    return (
      <Link
        to="/recipe/$slug"
        params={{ slug: recipe.slug }}
        className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl bg-accent p-8 text-canvas lg:aspect-[4/5]"
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-canvas/60">
          {badge ?? "From the kitchen"}
        </span>
        <div>
          <p className="font-display text-3xl font-medium leading-tight text-balance sm:text-4xl">{recipe.title}</p>
          <p className="mt-3 text-sm text-canvas/70">{recipe.category}</p>
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-canvas/80 group-hover:text-canvas">
          Read the recipe <span aria-hidden="true">→</span>
        </span>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-canvas/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full border border-canvas/10"
        />
      </Link>
    );
  }

  return (
    <Link
      to="/recipe/$slug"
      params={{ slug: recipe.slug }}
      className="group relative block aspect-[4/3] overflow-hidden rounded-3xl bg-surface-2 lg:aspect-[4/5]"
    >
      <img
        src={recipe.coverImageUrl}
        alt={recipe.title}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-8">
        {badge && (
          <span className="inline-flex rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] backdrop-blur-sm">
            {badge}
          </span>
        )}
        <p className="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/65">{recipe.category}</p>
        <h2 className="mt-1.5 font-display text-2xl font-medium leading-tight text-balance sm:text-3xl">
          {recipe.title}
        </h2>
      </div>
    </Link>
  );
});

export function RecipeGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="recipe-grid">
      {Array.from({ length: count }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton with a fixed count
        <div key={index}>
          <div className="skeleton aspect-[4/3] rounded-2xl" />
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-1/4" />
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecipePlaceholder() {
  return (
    <div className="flex size-full items-center justify-center text-line-strong">
      <PhotoIcon className="size-10" aria-hidden="true" />
    </div>
  );
}
