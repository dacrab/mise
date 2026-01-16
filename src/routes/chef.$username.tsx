import { createFileRoute, notFound } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PageLayout } from "@/components/ui/Layout";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { FollowButton, FollowStats } from "@/components/social/FollowButton";

export const Route = createFileRoute("/chef/$username")({
  component: ChefPage,
});

function ChefPage() {
  const { username } = Route.useParams();
  const { data: chef } = useSuspenseQuery(convexQuery(api.users.getByUsername, { username }));
  if (!chef) throw notFound();

  const currentUser = useQuery(api.users.currentUser);
  const { data: chefRecipes } = useSuspenseQuery(convexQuery(api.recipes.getByUser, { userId: chef._id }));
  const recipes = chefRecipes.filter((r) => r.status === "published");
  const isOwnProfile = currentUser?._id === chef._id;

  return (
    <PageLayout>
      <div className="wrapper">
        <div className="py-12 md:py-16 border-b border-cream-dark mb-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-sage/15 overflow-hidden shrink-0">
              {chef.profileImageUrl || chef.image ? (
                <img src={chef.profileImageUrl || chef.image} alt={chef.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-medium text-sage">{(chef.name || "U")[0]}</div>
              )}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-serif text-3xl font-medium mb-1">{chef.name}</h1>
              <p className="text-stone text-sm mb-3">@{chef.username}</p>
              {chef.bio && <p className="text-charcoal-light max-w-md mb-4">{chef.bio}</p>}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <FollowStats userId={chef._id} />
                <span className="text-sm text-charcoal"><strong>{recipes.length}</strong> recipes</span>
              </div>
              {!isOwnProfile && currentUser && (
                <div className="mt-4">
                  <FollowButton userId={chef._id} />
                </div>
              )}
            </div>
          </div>
        </div>

        <section>
          <h2 className="font-serif text-xl font-medium mb-6">Recipes</h2>
          {recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((r) => (
                <RecipeCard
                  key={r._id}
                  slug={r.slug}
                  title={r.title}
                  description={r.description}
                  category={r.category}
                  coverImageUrl={r.coverImageUrl}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center"><p className="text-stone">No recipes published yet.</p></div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
