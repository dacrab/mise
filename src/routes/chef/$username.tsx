import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "~/convex/_generated/api";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";

export const Route = createFileRoute("/chef/$username")({
  component: ChefPage,
});

function ChefPage() {
  const { username } = Route.useParams();
  const { data: chef } = useSuspenseQuery(
    convexQuery(api.users.getByUsername, { username })
  );

  if (!chef) {
    throw notFound();
  }

  const { data: chefRecipes } = useSuspenseQuery(
    convexQuery(api.recipes.getByUser, { userId: chef._id })
  );

  const publishedRecipes = chefRecipes.filter((r) => r.status === "published");

  return (
    <>
      <Header backLink={{ href: "/", label: "Back" }} />
      <main className="pt-20 pb-24">
        <div className="wrapper">
          {/* Profile */}
          <div className="py-12 md:py-16 border-b border-cream-dark mb-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-sage/15 overflow-hidden shrink-0">
                {chef.image ? (
                  <img src={chef.image} alt={chef.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-sage">
                    {(chef.name || "U")[0]}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="font-serif text-3xl font-medium mb-1">{chef.name}</h1>
                <p className="text-stone text-sm mb-3">@{chef.username}</p>
                {chef.bio && <p className="text-charcoal-light max-w-md">{chef.bio}</p>}
                <div className="mt-4 flex items-center justify-center sm:justify-start gap-4 text-sm">
                  <span className="text-charcoal"><strong>{publishedRecipes.length}</strong> recipes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recipes */}
          <section>
            <h2 className="font-serif text-xl font-medium mb-6">Recipes</h2>

            {publishedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedRecipes.map((recipe) => (
                  <Link key={recipe._id} to={`/recipe/${recipe.slug}`} className="recipe-card group">
                    <div className="relative overflow-hidden">
                      {recipe.coverImageUrl ? (
                        <img src={recipe.coverImageUrl} alt={recipe.title} className="recipe-card-image" />
                      ) : (
                        <div className="aspect-[4/3] bg-cream-dark flex items-center justify-center">
                          <svg className="text-stone-light" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                          </svg>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 tag bg-warm-white/90 backdrop-blur-sm">{recipe.category}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-sage transition-colors line-clamp-1">{recipe.title}</h3>
                      <p className="text-sm text-stone line-clamp-2">{recipe.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <p className="text-stone">No recipes published yet.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
