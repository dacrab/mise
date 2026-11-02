import { convexQuery } from "@convex-dev/react-query";
import { ArrowRightIcon, BookOpenIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useQueries } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Primitives";
import { FeaturedRecipeCard, RecipeCard, RecipeGridSkeleton, type RecipeSummary } from "@/components/ui/RecipeCard";
import { CATEGORIES, type Category, FEED_PAGE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function HomePage({ q, category }: { q?: string; category?: Category }) {
  const [cursors, setCursors] = useState<Array<string | null>>([null]);

  const queries = useQueries({
    queries: cursors.map((cursor) =>
      convexQuery(api.recipes.list, {
        paginationOpts: { numItems: FEED_PAGE_SIZE, cursor },
        search: q || undefined,
        category,
      }),
    ),
  });

  const pages = queries.flatMap((query) => (query.data ? [query.data] : []));
  const results = pages.flatMap((page) => page.page);
  const lastPage = pages[pages.length - 1];
  const isLoading = !queries[0]?.data;
  const isLoadingMore = !isLoading && queries[queries.length - 1]?.isFetching === true;
  const hasMore = lastPage !== undefined && !lastPage.isDone;

  const hasFilters = Boolean(q || category);
  const featured = !hasFilters ? results[0] : undefined;
  const grid = featured ? results.slice(1) : results;
  const heading = q ? `Results for “${q}”` : category ? category : "Latest recipes";

  const loadMore = () => {
    if (!lastPage || lastPage.isDone) return;
    setCursors((current) => [...current, lastPage.continueCursor]);
  };

  return (
    <PageLayout>
      <HomeHero featured={featured} />
      <RecipeFilters q={q} category={category} />
      <RecipeFeed
        results={results}
        grid={grid}
        featured={featured}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMore={hasMore}
        hasFilters={hasFilters}
        heading={heading}
        onLoadMore={loadMore}
      />
    </PageLayout>
  );
}

function HomeHero({ featured }: { featured?: RecipeSummary }) {
  return (
    <section className="container-page pt-12 pb-14 md:pt-20 md:pb-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="max-w-2xl">
          <p className="eyebrow">A recipe journal for home cooks</p>
          <h1 className="mt-5 text-5xl font-medium leading-[0.98] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Cook something <span className="italic text-accent">worth remembering.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            A quiet place to keep the recipes you actually make — and discover what everyone else is cooking.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/dashboard/create" className="btn-primary btn-lg">
              Share a recipe
              <ArrowRightIcon className="size-4" />
            </Link>
            <a href="#recipes" className="btn-secondary btn-lg">
              Browse recipes
            </a>
          </div>
          <dl className="mt-12 grid max-w-sm grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              ["Ads", "None"],
              ["Algorithms", "None"],
              ["Made by", "Home cooks"],
            ].map(([term, description]) => (
              <div key={term}>
                <dt className="eyebrow">{term}</dt>
                <dd className="mt-1 text-sm text-ink-soft">{description}</dd>
              </div>
            ))}
          </dl>
        </div>

        {featured ? <FeaturedRecipeCard recipe={featured} badge="Featured" /> : <HeroPanel />}
      </div>
    </section>
  );
}

function RecipeFeed({
  results,
  grid,
  featured,
  isLoading,
  isLoadingMore,
  hasMore,
  hasFilters,
  heading,
  onLoadMore,
}: {
  results: RecipeSummary[];
  grid: RecipeSummary[];
  featured?: RecipeSummary;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  hasFilters: boolean;
  heading: string;
  onLoadMore: () => void;
}) {
  const isEmpty = grid.length === 0 && !featured;

  return (
    <section id="recipes" className="container-page pb-24">
      <FeedHeader
        count={results.length}
        isLoading={isLoading}
        hasMore={hasMore}
        hasFilters={hasFilters}
        heading={heading}
      />

      <div className="mt-8">
        {isLoading ? (
          <RecipeGridSkeleton />
        ) : isEmpty ? (
          <EmptyFeed hasFilters={hasFilters} />
        ) : (
          <RecipeList grid={grid} hasMore={hasMore} isLoadingMore={isLoadingMore} onLoadMore={onLoadMore} />
        )}
      </div>
    </section>
  );
}

function FeedHeader({
  count,
  isLoading,
  hasMore,
  hasFilters,
  heading,
}: {
  count: number;
  isLoading: boolean;
  hasMore: boolean;
  hasFilters: boolean;
  heading: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-t border-line pt-8">
      <div>
        <p className="eyebrow">{hasFilters ? "Filtered" : "From the community"}</p>
        <h2 className="mt-2 text-2xl font-medium sm:text-3xl">{heading}</h2>
      </div>
      {!isLoading && (
        <p className="text-sm text-muted">
          {count} {count === 1 ? "recipe" : "recipes"}
          {hasMore ? "+" : ""}
        </p>
      )}
    </div>
  );
}

function EmptyFeed({ hasFilters }: { hasFilters: boolean }) {
  return (
    <EmptyState
      icon={hasFilters ? MagnifyingGlassIcon : BookOpenIcon}
      title={hasFilters ? "No recipes found" : "The table is empty"}
      description={
        hasFilters
          ? "Try a different search or category, or clear your filters."
          : "Be the first to share something worth cooking."
      }
    >
      <Link
        to={hasFilters ? "/" : "/dashboard/create"}
        search={hasFilters ? {} : undefined}
        className={hasFilters ? "btn-secondary" : "btn-primary"}
      >
        {hasFilters ? "Clear filters" : "Share a recipe"}
      </Link>
    </EmptyState>
  );
}

function RecipeList({
  grid,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: {
  grid: RecipeSummary[];
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <>
      <div className="recipe-grid">
        {grid.map((recipe, index) => (
          <RecipeCard key={recipe._id} recipe={recipe} priority={index < 3} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-12 flex justify-center">
          {isLoadingMore ? (
            <Spinner className="size-6 text-accent" />
          ) : (
            <button type="button" onClick={onLoadMore} className="btn-secondary">
              Load more recipes
            </button>
          )}
        </div>
      )}
    </>
  );
}

function RecipeFilters({ q, category }: { q?: string; category?: Category }) {
  const navigate = useNavigate();

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    void navigate({ to: "/", search: { q: term || undefined, category } });
  };

  return (
    <section className="container-page pb-8">
      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            key={q}
            type="search"
            name="q"
            defaultValue={q}
            placeholder="What are you craving?"
            aria-label="Search recipes"
            className="input h-12 pl-11"
          />
        </div>
        <button type="submit" className="btn-primary h-12 px-7">
          Search
        </button>
      </form>

      <div className="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          to="/"
          search={{ q, category: undefined }}
          className={cn("chip", !category && "chip-active")}
          aria-current={!category ? "page" : undefined}
        >
          All
        </Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item}
            to="/"
            search={{ q, category: category === item ? undefined : item }}
            className={cn("chip", category === item && "chip-active")}
            aria-current={category === item ? "page" : undefined}
          >
            {item}
          </Link>
        ))}
        {(q || category) && (
          <Link to="/" search={{}} className="link-muted ml-2 shrink-0 text-xs">
            Clear all
          </Link>
        )}
      </div>
    </section>
  );
}

function HeroPanel() {
  return (
    <div className="relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-3xl bg-accent p-8 text-canvas lg:aspect-[4/5]">
      <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-canvas/60">Mise en place</span>
      <blockquote className="max-w-sm font-display text-3xl font-medium leading-tight text-balance sm:text-4xl">
        “Good food is honest, generous, and always better shared.”
      </blockquote>
      <div>
        <p className="text-sm leading-relaxed text-canvas/70">Everything in its place, then something delicious.</p>
        <Link to="/dashboard/create" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-canvas/85">
          Start your collection <ArrowRightIcon className="size-4" />
        </Link>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-canvas/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full border border-canvas/10"
      />
    </div>
  );
}
