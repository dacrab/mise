import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePaginatedQuery } from "convex/react";
import { z } from "zod";
import { useState } from "react";
import { api } from "convex/_generated/api";
import { PageLayout, HomeLink } from "@/components/ui/Layout";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { TrendingRecipes } from "@/components/recipe/Discovery";
import { Select } from "@/components/ui/Select";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Vegan", "Quick & Easy", "Baking", "Italian", "Asian", "Mexican"];
const searchSchema = z.object({ q: z.string().optional(), category: z.string().optional() });

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
  const navigate = useNavigate();
  const hasSearch = !!q;
  const [selectedCategory, setSelectedCategory] = useState(category || "");

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQ = formData.get("q") as string;
    navigate({
      to: "/",
      search: { q: newQ || undefined, category: selectedCategory || undefined },
    });
  };

  // For search, use TanStack Query with Convex
  const searchQuery = useSuspenseQuery(convexQuery(api.recipes.list, { search: q || undefined, category: category || undefined, limit: 50 }));
  
  // For browsing, use Convex's native pagination (works on client)
  const paginatedQuery = usePaginatedQuery(
    api.recipes.listPaginated,
    { category: category || undefined },
    { initialNumItems: 20 }
  );

  const recipes = hasSearch ? searchQuery.data : paginatedQuery.results;
  const hasMore = !hasSearch && paginatedQuery.status === "CanLoadMore";
  const loadMore = () => paginatedQuery.loadMore(20);

  const hasFilters = q || category;
  const featured = !hasFilters && recipes.length > 0 ? recipes[0] : undefined;
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
        <form onSubmit={handleSearch} className="card p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input type="text" name="q" placeholder="What are you craving?" defaultValue={q} className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 focus:outline-none text-charcoal placeholder:text-stone" />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-stone w-5 h-5" />
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[{ label: "All categories", value: "" }, ...CATEGORIES.map((c) => ({ label: c, value: c }))]}
              placeholder="All categories"
            />
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
            {hasMore && (
              <div className="py-8 text-center">
                <button onClick={loadMore} className="btn-ghost">Load more</button>
              </div>
            )}
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-stone mb-4">No recipes yet.</p>
            <Link to="/dashboard/create" className="btn-primary">Be the first to share</Link>
          </div>
        )}
      </section>

      {!hasFilters && (
        <section className="wrapper pb-24">
          <TrendingRecipes />
        </section>
      )}
    </PageLayout>
  );
}
