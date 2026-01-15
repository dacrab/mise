import { createFileRoute, Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "convex/_generated/api";
import { PageLayout, HomeLink } from "@/components/ui/Layout";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { useEffect, useRef } from "react";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Vegan", "Quick & Easy", "Baking", "Italian", "Asian", "Mexican"];
const searchSchema = z.object({ q: z.string().default(""), category: z.string().default("") });

export const Route = createFileRoute("/")({
  validateSearch: searchSchema.parse,
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Mise - Share Your Recipes" },
      { name: "description", content: "Discover and share delicious recipes. From mise en place — the chef's practice of preparing everything before cooking." },
      { property: "og:title", content: "Mise - Share Your Recipes" },
      { property: "og:description", content: "Discover and share delicious recipes with the community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function HomePage() {
  const { q, category } = Route.useSearch();
  const hasSearch = !!q;

  const searchQuery = useSuspenseQuery(convexQuery(api.recipes.list, { search: q || undefined, category: category || undefined, limit: 50 }));
  const infiniteQuery = useSuspenseInfiniteQuery({
    queryKey: ["recipes", "paginated", category],
    queryFn: async ({ pageParam }: { pageParam: string | null }) => {
      const fn = convexQuery(api.recipes.listPaginated, { paginationOpts: { cursor: pageParam, numItems: 20 }, category: category || undefined });
      const queryFn = fn.queryFn;
      if (!queryFn) throw new Error("Query function not available");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return queryFn({} as any);
    },
    getNextPageParam: (lastPage) => lastPage.isDone ? undefined : lastPage.continueCursor,
    initialPageParam: null as string | null,
  });

  const recipes = hasSearch ? searchQuery.data : infiniteQuery.data.pages.flatMap((p) => p.page);
  const hasMore = !hasSearch && infiniteQuery.hasNextPage;
  const { fetchNextPage } = infiniteQuery;

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) fetchNextPage(); }, { rootMargin: "200px" });
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, fetchNextPage]);

  const hasFilters = q || category;
  const featured = !hasFilters ? recipes[0] : undefined;
  const grid = featured ? recipes.slice(1) : recipes;

  return (
    <PageLayout>
      <section className="wrapper">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-12 md:py-20 items-center">
          <div>
            <p className="font-hand text-2xl text-sage mb-3">from our kitchen to yours</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6">
              Recipes made<br />with <span className="italic text-sage">real love</span>
            </h1>
            <p className="text-lg text-charcoal-light leading-relaxed mb-8 max-w-md">No algorithms. No ads. Just home cooks sharing dishes that actually matter.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard/create" className="btn-primary">Share a recipe</Link>
              <a href="#recipes" className="btn-ghost">Browse recipes ↓</a>
            </div>
          </div>
          {featured ? (
            <RecipeCard slug={featured.slug} title={featured.title} coverImageUrl={featured.coverImageUrl} category={featured.category} variant="featured" badge="Featured" />
          ) : (
            <div className="hidden lg:flex aspect-[4/3] rounded-2xl bg-gradient-to-br from-sage/10 to-cream-dark items-center justify-center">
              <p className="font-hand text-3xl text-sage/40 rotate-[-5deg]">your recipe here</p>
            </div>
          )}
        </div>
      </section>

      <section className="wrapper -mt-2 mb-12">
        <form className="card p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input type="text" name="q" placeholder="What are you craving?" defaultValue={q} className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 focus:outline-none text-charcoal placeholder:text-stone" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <div className="flex gap-2">
            <select name="category" defaultValue={category} className="px-3 py-2 bg-cream-dark rounded-lg border-0 text-sm text-charcoal-light focus:outline-none focus:ring-2 focus:ring-sage/20">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn-primary px-6">Search</button>
          </div>
        </form>
        {hasFilters && (
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-stone">{recipes.length} result{recipes.length !== 1 && "s"}{q && <> for "<span className="text-charcoal font-medium">{q}</span>"</>}{category && <> in <span className="text-charcoal font-medium">{category}</span></>}</span>
            <HomeLink className="text-sage hover:underline">Clear</HomeLink>
          </div>
        )}
      </section>

      <section id="recipes" className="wrapper pb-24">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-xl font-medium">{hasFilters ? "Results" : "Latest recipes"}</h2>
          <span className="text-sm text-stone">{recipes.length} loaded</span>
        </div>
        {grid.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grid.map((r) => (
                <RecipeCard key={r._id} slug={r.slug} title={r.title} description={r.description} category={r.category} coverImageUrl={r.coverImageUrl} variant="list" />
              ))}
            </div>
            {hasMore && <div ref={loadMoreRef} className="py-8 text-center text-stone text-sm">Loading more...</div>}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-stone mb-4">No recipes yet.</p>
            <Link to="/dashboard/create" className="btn-primary">Be the first to share</Link>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
