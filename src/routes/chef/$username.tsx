import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/chef/$username")({
  component: ChefPage,
});

function ChefPage() {
  const { username } = Route.useParams();
  const { data: chef } = useSuspenseQuery(convexQuery(api.users.getByUsername, { username }));
  if (!chef) throw notFound();

  const { data: chefRecipes } = useSuspenseQuery(convexQuery(api.recipes.getByUser, { userId: chef._id }));
  const recipes = chefRecipes.filter((r) => r.status === "published");

  return (
    <>
      <Header backLink={{ href: "/", label: "Back" }} />
      <main className="pt-20 pb-24">
        <div className="wrapper">
          <div className="py-12 md:py-16 border-b border-cream-dark mb-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-sage/15 overflow-hidden shrink-0">
                {chef.image ? (
                  <img src={chef.image} alt={chef.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-sage">{(chef.name || "U")[0]}</div>
                )}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="font-serif text-3xl font-medium mb-1">{chef.name}</h1>
                <p className="text-stone text-sm mb-3">@{chef.username}</p>
                {chef.bio && <p className="text-charcoal-light max-w-md">{chef.bio}</p>}
                <p className="mt-4 text-sm text-charcoal"><strong>{recipes.length}</strong> recipes</p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="font-serif text-xl font-medium mb-6">Recipes</h2>
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((r) => (
                  <Link key={r._id} to={`/recipe/${r.slug}`} className="recipe-card group">
                    <div className="relative overflow-hidden">
                      {r.coverImageUrl ? (
                        <img src={r.coverImageUrl} alt={r.title} className="recipe-card-image" />
                      ) : (
                        <div className="aspect-[4/3] bg-cream-dark flex items-center justify-center text-stone-light">🍳</div>
                      )}
                      <span className="absolute top-3 left-3 tag bg-warm-white/90 backdrop-blur-sm">{r.category}</span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-lg font-medium mb-2 group-hover:text-sage line-clamp-1">{r.title}</h3>
                      <p className="text-sm text-stone line-clamp-2">{r.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center"><p className="text-stone">No recipes published yet.</p></div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
