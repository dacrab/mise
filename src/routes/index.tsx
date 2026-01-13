import { createFileRoute, Link } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Dessert", "Vegan", "Quick & Easy", "Baking", "Italian", "Asian", "Mexican"];

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
    category: (search.category as string) || "",
  }),
  component: HomePage,
});

function HomePage() {
  const { q: search, category } = Route.useSearch();
  const { data: allRecipes } = useSuspenseQuery(
    convexQuery(api.recipes.list, {
      search: search || undefined,
      category: category || undefined,
      limit: 50,
    })
  );

  const hasFilters = search || category;
  const featuredRecipe = !hasFilters && allRecipes.length > 0 ? allRecipes[0] : null;
  const gridRecipes = featuredRecipe ? allRecipes.slice(1) : allRecipes;

  const delay = (s: number) => ({ "--delay": `${s}s` } as React.CSSProperties);

  return (
    <>
      <Header />
      <main className="pt-20 min-h-screen">
        {/* Hero */}
        <section className="wrapper">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 py-12 md:py-20 items-center">
            <div>
              <p className="font-hand text-2xl text-sage mb-3 fade-in" style={delay(0)}>from our kitchen to yours</p>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1] mb-6 fade-in" style={delay(0.1)}>
                Recipes made<br />with <span className="italic text-sage">real love</span>
              </h1>
              <p className="text-lg text-charcoal-light leading-relaxed mb-8 max-w-md fade-in" style={delay(0.2)}>
                No algorithms. No ads. Just home cooks sharing dishes that actually matter to them.
              </p>
              <div className="flex flex-wrap gap-3 fade-in" style={delay(0.3)}>
                <Link to="/dashboard/create" className="btn-primary">Share a recipe</Link>
                <a href="#recipes" className="btn-ghost">Browse recipes ↓</a>
              </div>
            </div>

            {featuredRecipe ? (
              <Link to={`/recipe/${featuredRecipe.slug}`} className="group relative block fade-in scale-in" style={delay(0.2)}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-cream-dark">
                  {featuredRecipe.coverImageUrl ? (
                    <img src={featuredRecipe.coverImageUrl} alt={featuredRecipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-light">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-warm-white/95 backdrop-blur-sm rounded-xl p-4 shadow-card slide-up" style={delay(0.4)}>
                  <span className="tag-sage text-[10px] mb-2">Featured</span>
                  <h3 className="font-serif text-lg font-medium group-hover:text-sage transition-colors">{featuredRecipe.title}</h3>
                </div>
              </Link>
            ) : (
              <div className="hidden lg:block aspect-[4/3] rounded-2xl bg-gradient-to-br from-sage/10 to-cream-dark relative overflow-hidden fade-in" style={delay(0.2)}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="font-hand text-3xl text-sage/40 rotate-[-5deg]">your recipe here</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search */}
        <section className="wrapper -mt-2 mb-12 fade-in" style={delay(0.35)}>
          <form className="card p-3 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                name="q"
                placeholder="What are you craving?"
                defaultValue={search}
                className="w-full pl-10 pr-4 py-2.5 bg-transparent border-0 focus:outline-none focus:ring-0 text-charcoal placeholder:text-stone"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <div className="flex gap-2">
              <select name="category" defaultValue={category} className="px-3 py-2 bg-cream-dark rounded-lg border-0 text-sm text-charcoal-light focus:outline-none focus:ring-2 focus:ring-sage/20">
                <option value="">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button type="submit" className="btn-primary px-6">Search</button>
            </div>
          </form>

          {hasFilters && (
            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="text-stone">
                {allRecipes.length} result{allRecipes.length !== 1 ? "s" : ""}
                {search && <> for "<span className="text-charcoal font-medium">{search}</span>"</>}
                {category && <> in <span className="text-charcoal font-medium">{category}</span></>}
              </span>
              <Link to="/" className="text-sage hover:underline">Clear</Link>
            </div>
          )}
        </section>

        {/* Recipes */}
        <section id="recipes" className="wrapper pb-24">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-serif text-xl font-medium">{hasFilters ? "Results" : "Latest recipes"}</h2>
            <span className="text-sm text-stone">{allRecipes.length} total</span>
          </div>

          {gridRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridRecipes.map((recipe, i) => (
                <Link key={recipe._id} to={`/recipe/${recipe.slug}`} className="group flex gap-4 p-3 -m-3 rounded-xl hover:bg-warm-white transition-colors stagger-item" style={delay(0.4 + i * 0.05)}>
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-cream-dark shrink-0">
                    {recipe.coverImageUrl ? (
                      <img src={recipe.coverImageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-light">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1">
                    <span className="text-[11px] text-stone uppercase tracking-wide">{recipe.category}</span>
                    <h3 className="font-serif text-base font-medium mt-0.5 mb-1 group-hover:text-sage transition-colors line-clamp-1">{recipe.title}</h3>
                    <p className="text-sm text-stone line-clamp-2">{recipe.description || "A delicious recipe."}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-stone mb-4">No recipes yet.</p>
              <Link to="/dashboard/create" className="btn-primary">Be the first to share</Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
