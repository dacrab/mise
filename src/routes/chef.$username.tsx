import { convexQuery } from "@convex-dev/react-query";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { PageLayout } from "@/components/layout/PageLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Primitives";
import { RecipeCard, RecipeGridSkeleton } from "@/components/ui/RecipeCard";
import { RouteError } from "@/components/ui/RouteError";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

function ChefSkeleton() {
  return (
    <PageLayout>
      <div className="border-b border-line bg-surface">
        <div className="container-page flex animate-pulse flex-col items-center gap-6 py-12 sm:flex-row sm:items-end">
          <div className="skeleton size-24 rounded-full" />
          <div className="space-y-3 text-center sm:text-left">
            <div className="skeleton h-9 w-48" />
            <div className="skeleton h-4 w-28" />
          </div>
        </div>
      </div>
      <div className="container-page py-12">
        <RecipeGridSkeleton />
      </div>
    </PageLayout>
  );
}

export const Route = createFileRoute("/chef/$username")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.users.getByUsername, { username: params.username })),
  component: ChefPage,
  pendingComponent: ChefSkeleton,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.name ? `${loaderData.name}'s Kitchen${APP_TITLE_SUFFIX}` : `Chef${APP_TITLE_SUFFIX}` },
      {
        name: "description",
        content: loaderData?.bio ?? (loaderData?.name ? `Recipes by ${loaderData.name} on Mise.` : "Chef on Mise."),
      },
      { property: "og:title", content: loaderData?.name ? `${loaderData.name}'s Kitchen` : "Chef" },
      { property: "og:description", content: loaderData?.bio ?? "Recipes shared on Mise." },
      ...(loaderData?.profileImageUrl ? [{ property: "og:image", content: loaderData.profileImageUrl }] : []),
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ChefPage() {
  const { username } = Route.useParams();
  const { data: chef } = useSuspenseQuery(convexQuery(api.users.getByUsername, { username }));

  if (!chef) throw notFound();

  const { data: chefRecipes } = useSuspenseQuery(convexQuery(api.recipes.getByUser, { userId: chef._id }));
  const recipes = chefRecipes.filter((recipe) => recipe.status === "published");

  return (
    <PageLayout>
      <header className="border-b border-line bg-surface">
        <div className="container-page py-12 md:py-16">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
            <Avatar src={chef.profileImageUrl} name={chef.name} size="xl" className="ring-4 ring-canvas" />
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Chef</p>
              <h1 className="mt-2 text-4xl font-medium sm:text-5xl">{chef.name ?? "Chef"}</h1>
              {chef.username && <p className="mt-1 text-sm text-muted">@{chef.username}</p>}
              {chef.bio && <p className="mt-4 max-w-xl text-pretty leading-relaxed text-ink-soft">{chef.bio}</p>}
            </div>
            <div className="shrink-0 rounded-2xl border border-line bg-canvas px-5 py-3 text-center">
              <p className="font-display text-2xl font-medium">{recipes.length}</p>
              <p className="text-xs text-muted">{recipes.length === 1 ? "recipe" : "recipes"}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-12 md:py-16">
        <h2 className="text-2xl font-medium">Recipes</h2>
        {recipes.length > 0 ? (
          <div className="recipe-grid mt-8">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe._id} recipe={recipe} priority={index < 3} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              icon={BookOpenIcon}
              title="No recipes yet"
              description="This chef hasn't published a recipe yet. Check back soon."
            />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
