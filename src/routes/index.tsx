import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { usePaginatedQuery, useQuery } from "convex/react";
import { useRef } from "react";
import { z } from "zod";
import { PageLayout } from "@/components/layout/PageLayout";
import { Spinner } from "@/components/ui/Primitives";
import { FeaturedRecipeCard, RecipeCard, RecipeGridSkeleton } from "@/components/ui/RecipeCard";
import { CATEGORIES, CATEGORY_ICONS } from "@/lib/constants";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema.parse,
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Mise - Share Your Recipes" },
      {
        name: "description",
        content:
          "Discover and share delicious recipes. From mise en place — the chef's practice of preparing everything before cooking.",
      },
      { property: "og:title", content: "Mise - Share Your Recipes" },
      { property: "og:description", content: "Discover and share delicious recipes with the community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type FeedItem = {
  _id: Id<"recipes">;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  coverImageUrl?: string | null;
};

function useRecipeFeed() {
  const { q, category } = Route.useSearch();

  const isSearching = !!q;
  const isFiltered = !!q || !!category;

  const searchResults = useQuery(api.recipes.list, isSearching ? { search: q, category: category, limit: 50 } : "skip");

  const paginated = usePaginatedQuery(api.recipes.listPaginated, { category: category }, { initialNumItems: 20 });

  const isLoading = isSearching ? searchResults === undefined : paginated.status === "LoadingFirstPage";

  const recipes: FeedItem[] = isSearching ? (searchResults ?? []) : paginated.results;

  // First unfiltered result doubles as the hero card
  const featured = !isFiltered && paginated.results.length > 0 ? paginated.results[0] : undefined;
  const grid = featured ? recipes.slice(1) : recipes;
  const showEmpty = grid.length === 0 && !featured;

  return { q, category, isSearching, isFiltered, isLoading, recipes, featured, grid, showEmpty, paginated };
}

function HomePage() {
  const { q, category, isSearching, isFiltered, isLoading, recipes, featured, grid, showEmpty, paginated } =
    useRecipeFeed();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInputRef.current?.value.trim() ?? "";
    navigate({ to: "/", search: { q: q || undefined, category: category } });
  };

  const handleCategoryClick = (cat: string | undefined) => {
    navigate({ to: "/", search: { q: q, category: cat } });
  };

  const clearFilters = () => {
    if (searchInputRef.current) searchInputRef.current.value = "";
    navigate({ to: "/", search: {} });
  };

  return (
    <PageLayout>
      <section className="wrapper">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-12 md:py-20 items-center">
          <div>
            <p className="font-hand text-2xl text-sage mb-3">from our kitchen to yours</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
              Recipes made
              <br />
              with <span className="italic text-sage">real love</span>
            </h1>
            <p className="text-lg text-secondary leading-relaxed mb-8 max-w-md">
              No algorithms. No ads. Just home cooks sharing dishes that actually matter.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard/create" className="btn-primary">
                Share a recipe
              </Link>
              <a href="#recipes" className="btn-ghost">
                Browse recipes ↓
              </a>
            </div>
          </div>
          {featured ? (
            <FeaturedRecipeCard
              slug={featured.slug}
              title={featured.title}
              coverImageUrl={featured.coverImageUrl}
              badge="Featured"
            />
          ) : (
            <div className="hidden lg:flex aspect-[4/3] rounded-2xl bg-gradient-to-br from-sage/10 to-cream-dark items-center justify-center">
              <p className="font-hand text-3xl text-sage/40 rotate-[-5deg]">your recipe here</p>
            </div>
          )}
        </div>
      </section>

      <CategoryFilter category={category} onPick={handleCategoryClick} />

      <section className="wrapper -mt-2 mb-12">
        <SearchForm searchInputRef={searchInputRef} defaultValue={q} onSubmit={handleSearch} />

        {isFiltered && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-stone">
              {recipes.length} result{recipes.length !== 1 ? "s" : ""}
              {q && (
                <>
                  {" "}
                  for "<span className="text-primary font-medium">{q}</span>"
                </>
              )}
              {category && (
                <>
                  {" "}
                  in <span className="text-primary font-medium">{category}</span>
                </>
              )}
            </span>
            <button type="button" onClick={clearFilters} className="flex items-center gap-1 text-sage hover:underline">
              <XMarkIcon className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        )}
      </section>

      <RecipeResultsSection
        heading={category ? category : q ? "Search results" : "Latest recipes"}
        isLoading={isLoading}
        showEmpty={showEmpty}
        isSearching={isSearching}
        emptyState={
          isFiltered ? <FilteredEmptyState category={category} onClearFilters={clearFilters} /> : <EmptyFeedState />
        }
        grid={grid}
        loadMoreStatus={paginated.status}
        onLoadMore={() => paginated.loadMore(20)}
        count={recipes.length}
      />
    </PageLayout>
  );
}

function CategoryFilter({ category, onPick }: { category?: string; onPick: (cat: string | undefined) => void }) {
  return (
    <section className="wrapper -mt-4 mb-6">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-minimal">
        <button
          type="button"
          onClick={() => onPick(undefined)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
              : "bg-cream-dark dark:bg-d-surface-raised text-stone hover:text-charcoal dark:hover:text-d-text"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => onPick(category === c ? undefined : c)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c
                ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
                : "bg-cream-dark dark:bg-d-surface-raised text-stone hover:text-charcoal dark:hover:text-d-text"
            }`}
          >
            <span>{CATEGORY_ICONS[c]}</span>
            {c}
          </button>
        ))}
      </div>
    </section>
  );
}

function SearchForm({
  searchInputRef,
  defaultValue,
  onSubmit,
}: {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  defaultValue?: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="card p-3 flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone w-5 h-5" />
        <input
          ref={searchInputRef}
          type="text"
          name="q"
          placeholder="What are you craving?"
          defaultValue={defaultValue}
          className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 focus:outline-none text-primary placeholder:text-stone"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary px-6">
          Search
        </button>
      </div>
    </form>
  );
}

function FilteredEmptyState({ category, onClearFilters }: { category?: string; onClearFilters: () => void }) {
  return (
    <>
      <p className="font-serif text-2xl font-medium text-primary mb-2">No recipes found</p>
      <p className="text-stone mb-6">{category ? `No ${category} recipes yet.` : "Try different keywords."}</p>
      <button type="button" onClick={onClearFilters} className="btn-ghost">
        Clear filters
      </button>
    </>
  );
}

function EmptyFeedState() {
  return (
    <>
      <p className="text-stone mb-4">No recipes yet.</p>
      <Link to="/dashboard/create" className="btn-primary">
        Be the first to share
      </Link>
    </>
  );
}

function RecipeResultsSection({
  heading,
  isLoading,
  showEmpty,
  isSearching,
  emptyState,
  grid,
  loadMoreStatus,
  onLoadMore,
  count,
}: {
  heading: string;
  isLoading: boolean;
  showEmpty: boolean;
  isSearching: boolean;
  emptyState: React.ReactNode;
  grid: Array<{
    _id: Id<"recipes">;
    slug: string;
    title: string;
    description?: string | null;
    category: string;
    coverImageUrl?: string | null;
  }>;
  loadMoreStatus: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  onLoadMore: () => void;
  count: number;
}) {
  return (
    <section id="recipes" className="wrapper pb-24">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="font-serif text-xl font-medium">{heading}</h2>
        {!isLoading && <span className="text-sm text-stone">{count} recipes</span>}
      </div>

      {isLoading ? (
        <RecipeGridSkeleton />
      ) : !showEmpty ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {grid.map((r) => (
              <RecipeCard
                key={r._id}
                recipeId={r._id}
                slug={r.slug}
                title={r.title}
                description={r.description}
                category={r.category}
                coverImageUrl={r.coverImageUrl}
              />
            ))}
          </div>
          {!isSearching && loadMoreStatus === "CanLoadMore" && (
            <div className="py-8 text-center">
              <button
                type="button"
                onClick={onLoadMore}
                disabled={loadMoreStatus !== "CanLoadMore"}
                className="btn-ghost disabled:opacity-50"
              >
                Load more
              </button>
            </div>
          )}
          {!isSearching && loadMoreStatus === "LoadingMore" && (
            <div className="py-8 flex justify-center">
              <Spinner />
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">{emptyState}</div>
      )}
    </section>
  );
}
