import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";

import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { PageLayout } from "@/components/layout/PageLayout";
import { FollowButton, FollowStats } from "@/components/social/Follow";
import { Avatar } from "@/components/ui/Primitives";
import { RecipeCard, RecipeGridSkeleton } from "@/components/ui/RecipeCard";

function ChefSkeleton() {
  return (
    <PageLayout>
      <div className="wrapper py-8 md:py-16 animate-pulse">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b border-cream-dark">
          <div className="w-24 h-24 rounded-full bg-cream-dark shrink-0" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div className="h-7 w-48 bg-cream-dark rounded mx-auto sm:mx-0" />
            <div className="h-4 w-24 bg-cream-dark rounded mx-auto sm:mx-0" />
            <div className="h-4 w-full max-w-sm bg-cream-dark rounded mx-auto sm:mx-0" />
            <div className="h-4 w-3/4 max-w-xs bg-cream-dark rounded mx-auto sm:mx-0" />
            <div className="flex gap-4 justify-center sm:justify-start pt-2">
              <div className="h-4 w-24 bg-cream-dark rounded" />
              <div className="h-4 w-24 bg-cream-dark rounded" />
            </div>
          </div>
        </div>
        <RecipeGridSkeleton />
      </div>
    </PageLayout>
  );
}

export const Route = createFileRoute("/chef/$username")({
  // Pre-fetch chef profile so the page renders immediately on navigation
  // and bots get fully-populated HTML for SEO.
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.users.getByUsername, { username: params.username })),
  pendingComponent: ChefSkeleton,
  component: ChefPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.name ? `${loaderData.name}'s Kitchen${APP_TITLE_SUFFIX}` : `Chef${APP_TITLE_SUFFIX}` },
      { name: "description", content: loaderData?.bio ?? (loaderData?.name ? `Recipes by ${loaderData.name} on Mise` : "Chef on Mise") },
      { property: "og:title", content: loaderData?.name ? `${loaderData.name}'s Kitchen` : "Chef" },
      { property: "og:type", content: "profile" },
    ],
  }),
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
            <Avatar src={chef.profileImageUrl ?? chef.image} name={chef.name} size="lg" className="!w-24 !h-24 text-2xl" />
            <div className="text-center sm:text-left">
              <h1 className="font-serif text-3xl font-medium mb-1">{chef.name}</h1>
              {chef.username && <p className="text-stone text-sm mb-3">@{chef.username}</p>}
              {chef.bio && <p className="text-charcoal-light max-w-md mb-4">{chef.bio}</p>}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <FollowStats userId={chef._id} />
                <span className="text-sm text-charcoal">
                  <strong>{recipes.length}</strong> recipes
                </span>
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
                  recipeId={r._id}
                  slug={r.slug}
                  title={r.title}
                  description={r.description}
                  category={r.category}
                  coverImageUrl={r.coverImageUrl}
                />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-stone">No recipes published yet.</p>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
