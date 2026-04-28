import { convexQuery } from "@convex-dev/react-query";
import { ClockIcon, FireIcon, PrinterIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { PlayIcon as PlayIconSolid } from "@heroicons/react/24/solid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PageLayout } from "@/components/layout/PageLayout";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { ShareButton } from "@/components/recipe/RecipeActions";
import { IngredientScaler } from "@/components/recipe/RecipeWidgets";
import { Avatar } from "@/components/ui/Primitives";
import { BookmarkIcon as BookmarkOutlineIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";
import type { Id } from "convex/_generated/dataModel";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export const Route = createFileRoute("/recipe/$slug")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug })),
  component: RecipePage,
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.title ? `${loaderData.title}${APP_TITLE_SUFFIX}` : `Recipe${APP_TITLE_SUFFIX}` },
      { name: "description", content: loaderData?.description ?? "A delicious recipe on Mise" },
      { property: "og:title", content: loaderData?.title ?? "Recipe" },
      { property: "og:description", content: loaderData?.description ?? "A delicious recipe on Mise" },
      { property: "og:image", content: loaderData?.coverImageUrl ?? "" },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function SaveButton({ recipeId }: { recipeId: Id<"recipes"> }) {
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const toggleBookmarkMutation = useMutation(api.social.toggleBookmark);
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const isBookmarked = bookmarks?.some((recipe) => recipe._id === recipeId) ?? false;

  const handleClick = async () => {
    if (isPending) return;
    setIsPending(true);
    try {
      await toggleBookmarkMutation({ recipeId });
    } catch {
      toast("Sign in to save recipes", "error");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isBookmarked ? "Remove from saved" : "Save recipe"}
      aria-pressed={isBookmarked}
      className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50 ${isBookmarked ? "text-sage" : "text-stone hover:text-sage"}`}
    >
      {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkOutlineIcon className="w-4 h-4" />}
      {isBookmarked ? "Saved" : "Save"}
    </button>
  );
}

function RecipePage() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));

  if (!recipe) throw notFound();

  return (
    <PageLayout>
      <article className="wrapper max-w-4xl">
        <header className="py-12 md:py-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="tag-sage">{recipe.category ?? "Recipe"}</span>
          </div>
          <h1 className="heading-1 text-3xl sm:text-4xl md:text-5xl mb-4">{recipe.title}</h1>
          {recipe.description && <p className="body-large max-w-2xl">{recipe.description}</p>}

          {(recipe.prepTime || recipe.cookTime || recipe.servings || recipe.difficulty) && (
            <div className="flex flex-wrap gap-3 mt-6">
              {recipe.prepTime && (
                <div className="stat-box">
                  <div className="text-stone">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-stone uppercase tracking-wide">Prep</span>
                  <span className="text-sm font-medium text-charcoal">{recipe.prepTime} min</span>
                </div>
              )}
              {recipe.cookTime && (
                <div className="stat-box">
                  <div className="text-stone">
                    <FireIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-stone uppercase tracking-wide">Cook</span>
                  <span className="text-sm font-medium text-charcoal">{recipe.cookTime} min</span>
                </div>
              )}
              {recipe.prepTime && recipe.cookTime && (
                <div className="stat-box">
                  <div className="text-stone">
                    <ClockIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-stone uppercase tracking-wide">Total</span>
                  <span className="text-sm font-medium text-charcoal">{recipe.prepTime + recipe.cookTime} min</span>
                </div>
              )}
              {recipe.servings && (
                <div className="stat-box">
                  <div className="text-stone">
                    <UserGroupIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-stone uppercase tracking-wide">Servings</span>
                  <span className="text-sm font-medium text-charcoal">{recipe.servings}</span>
                </div>
              )}
              {recipe.difficulty && (
                <div className="stat-box">
                  <div className="text-stone">
                    <FireIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-stone uppercase tracking-wide">Difficulty</span>
                  <span className="text-sm font-medium text-charcoal">{recipe.difficulty}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-cream-dark">
            <Link
              to="/chef/$username"
              params={{ username: recipe.author?.username ?? "unknown" }}
              className="flex items-center gap-3 group"
            >
              <Avatar
                src={recipe.author?.image}
                name={recipe.author?.name ?? "Chef"}
                size="md"
                className="ring-2 ring-cream-dark"
              />
              <div>
                <span className="block text-sm font-medium text-charcoal group-hover:text-sage transition-colors">
                  {recipe.author?.name ?? "Chef"}
                </span>
                <span className="block text-xs text-stone">View kitchen →</span>
              </div>
            </Link>
            <span className="text-stone-light">·</span>
            <time className="text-sm text-stone">
              {new Date(recipe._creationTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </header>

        {recipe.coverImageUrl && (
          <div className="rounded-2xl overflow-hidden aspect-video bg-cream-dark mb-12 relative">
            <img src={recipe.coverImageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            {recipe.videoUrl && (
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 btn-primary text-sm flex items-center gap-1.5"
              >
                <PlayIconSolid className="w-4 h-4" />
                Watch video
              </a>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">
          <aside>
            <div className="card p-6 sticky top-24">
              <h3 className="font-serif text-lg font-medium mb-4">Ingredients</h3>
              <IngredientScaler ingredients={recipe.ingredients} defaultServings={recipe.servings ?? 4} />
            </div>
          </aside>

          <section>
            <h3 className="font-serif text-lg font-medium mb-6">Instructions</h3>
            <ol className="space-y-6">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-charcoal-light leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 pt-8 border-t border-cream-dark">
              <div className="flex items-center gap-4 flex-wrap">
                <SaveButton recipeId={recipe._id} />
                <ShareButton title={recipe.title} />
                <Link
                  to="/recipe/$slug/print"
                  params={{ slug }}
                  className="flex items-center gap-1.5 text-sm text-stone hover:text-sage"
                >
                  <PrinterIcon className="w-4 h-4" />
                  Print
                </Link>
              </div>
            </div>
          </section>
        </div>
      </article>
    </PageLayout>
  );
}
