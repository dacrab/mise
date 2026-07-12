import { convexQuery } from "@convex-dev/react-query";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { PageLayout } from "@/components/layout/PageLayout";
import { Avatar } from "@/components/ui/Primitives";
import { RecipeCard, RecipeGridSkeleton } from "@/components/ui/RecipeCard";
import { RouteError } from "@/components/ui/RouteError";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

function ChefSkeleton() {
  return (
    <PageLayout>
      <div className="hero-banner py-16 px-5 animate-pulse">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <div className="w-28 h-28 rounded-full bg-white/10 shrink-0" />
          <div className="space-y-3">
            <div className="h-8 w-48 bg-white/10 rounded" />
            <div className="h-4 w-24 bg-white/10 rounded" />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-5 py-10">
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
      {
        name: "description",
        content: loaderData?.bio ?? (loaderData?.name ? `Recipes by ${loaderData.name} on Mise` : "Chef on Mise"),
      },
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
      <div className="hero-banner py-14 md:py-20 px-5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-6">
          <Avatar
            src={chef.profileImageUrl ?? chef.image}
            name={chef.name}
            size="lg"
            className="!w-28 !h-28 text-3xl ring-4 ring-white/20"
          />
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-cream mb-1">{chef.name}</h1>
            {chef.username && <p className="text-sage-light text-sm mb-3">@{chef.username}</p>}
            {chef.bio && <p className="text-cream/70 max-w-md mb-4">{chef.bio}</p>}
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
              <span className="font-serif text-lg font-medium text-cream">{recipes.length}</span>
              <span className="text-sm text-cream/70">{recipes.length === 1 ? "recipe" : "recipes"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 py-10 md:py-14">
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
          <div className="card p-16 text-center">
            <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpenIcon className="w-9 h-9 text-sage" />
            </div>
            <h3 className="font-serif text-2xl font-medium mb-2">No recipes yet</h3>
            <p className="text-stone max-w-sm mx-auto">This chef hasn't published any recipes yet. Check back soon!</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
