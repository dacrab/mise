import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";

import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { PageLayout } from "@/components/layout/PageLayout";
import { Avatar } from "@/components/ui/Primitives";
import { RecipeCard, RecipeGridSkeleton } from "@/components/ui/RecipeCard";
import { RouteError } from "@/components/ui/RouteError";

function ChefSkeleton() {
  return (
    <PageLayout>
      <div className="wrapper py-8 md:py-16 animate-pulse">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b border-cream-dark">
          <div className="w-24 h-24 rounded-full bg-cream-dark shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 bg-cream-dark rounded" />
            <div className="h-4 w-24 bg-cream-dark rounded" />
            <div className="h-4 w-full max-w-sm bg-cream-dark rounded" />
          </div>
        </div>
        <RecipeGridSkeleton />
      </div>
    </PageLayout>
  );
}

/**
 * Chef profile route with SSR support.
 * 
 * SSR Pattern:
 * - loader: Prefetches chef data on the server using ensureQueryData
 * - useSuspenseQuery: Reads from cache (populated by loader) without waterfalls
 * - pendingComponent: Shows skeleton while navigating client-side
 * - errorComponent: Gracefully handles loader failures and notFound() errors
 * 
 * This ensures the chef profile HTML is rendered on the server for SEO and fast FCP.
 */
export const Route = createFileRoute("/chef/$username")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.users.getByUsername, { username: params.username })),
  pendingComponent: ChefSkeleton,
  component: ChefPage,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
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

  const { data: chefRecipes } = useSuspenseQuery(convexQuery(api.recipes.getByUser, { userId: chef._id }));
  const recipes = chefRecipes.filter((r) => r.status === "published");

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
              <span className="text-sm text-charcoal">
                <strong>{recipes.length}</strong> recipes
              </span>
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
