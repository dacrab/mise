import { convexQuery } from "@convex-dev/react-query";
import { ClockIcon, FireIcon, PrinterIcon, ShareIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import { PlayIcon as PlayIconSolid } from "@heroicons/react/24/solid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BookmarkButton } from "@/components/recipe/BookmarkButton";
import { MetaStat } from "@/components/ui/MetaStat";
import { Avatar } from "@/components/ui/Primitives";
import { RouteError } from "@/components/ui/RouteError";
import { useToast } from "@/components/ui/Toast";
import { APP_TITLE_SUFFIX, MAX_SERVINGS, MIN_SERVINGS } from "@/lib/constants";
import { scaleIngredient } from "@/lib/utils";

export const Route = createFileRoute("/recipe/$slug")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug })),
  component: RecipePage,
  pendingComponent: () => <div className="center min-h-[60vh] text-stone animate-pulse">Loading…</div>,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
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

function ShareButton({ title }: { title: string }) {
  const { toast } = useToast();
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied!", "success");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") toast("Could not share", "error");
    }
  };
  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="flex items-center gap-1.5 text-sm text-stone hover:text-sage transition-colors"
      aria-label="Share"
    >
      <ShareIcon className="w-4 h-4" />
      Share
    </button>
  );
}

function IngredientScaler({ ingredients, defaultServings = 4 }: { ingredients: string[]; defaultServings?: number }) {
  const [servings, setServings] = useState(defaultServings);
  const scale = servings / defaultServings;
  const scaled = useMemo(() => ingredients.map((ing) => scaleIngredient(ing, scale)), [ingredients, scale]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="servings-input" className="text-sm font-medium text-secondary">
          Servings:
        </label>
        <button
          type="button"
          onClick={() => setServings(Math.max(MIN_SERVINGS, servings - 1))}
          className="w-8 h-8 rounded-lg surface-raised hover:bg-stone-light/50 dark:hover:bg-d-border flex items-center justify-center text-primary transition-colors"
          aria-label="Decrease servings"
        >
          −
        </button>
        <input
          id="servings-input"
          type="number"
          min={MIN_SERVINGS}
          max={MAX_SERVINGS}
          value={servings}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!Number.isNaN(v) && v >= MIN_SERVINGS && v <= MAX_SERVINGS) setServings(v);
          }}
          className="w-12 text-center font-medium text-primary bg-transparent border-b border-stone-light dark:border-d-border-strong focus:outline-none focus:border-sage"
          aria-label="Number of servings"
        />
        <button
          type="button"
          onClick={() => setServings(servings + 1)}
          className="w-8 h-8 rounded-lg surface-raised hover:bg-stone-light/50 dark:hover:bg-d-border flex items-center justify-center text-primary transition-colors"
          aria-label="Increase servings"
        >
          +
        </button>
        {servings !== defaultServings && (
          <button
            type="button"
            onClick={() => setServings(defaultServings)}
            className="text-xs text-sage hover:text-sage-light"
          >
            Reset
          </button>
        )}
      </div>
      <ul className="space-y-2">
        {scaled.map((ing, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: ingredients may repeat, so value alone is not a unique key
          <li key={`${ing}-${i}`} className="text-sm text-secondary flex gap-2">
            <span className="text-stone mt-0.5">·</span>
            <span>{ing}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecipeAuthor({
  author,
  createdAt,
}: {
  author?: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
    profileImageUrl?: string | null;
  } | null;
  createdAt: number;
}) {
  const nameClass = author?.username
    ? "block text-sm font-medium text-primary group-hover:text-sage transition-colors"
    : "block text-sm font-medium text-primary";
  const content = (
    <>
      <Avatar
        src={author?.profileImageUrl ?? author?.image}
        name={author?.name ?? "Chef"}
        size="md"
        className="ring-2 ring-cream-dark dark:ring-d-border"
      />
      <div>
        <span className={nameClass}>{author?.name ?? "Chef"}</span>
        <time className="block text-xs text-stone">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </div>
    </>
  );

  if (author?.username) {
    return (
      <Link to="/chef/$username" params={{ username: author.username }} className="flex items-center gap-3 group">
        {content}
      </Link>
    );
  }
  return <div className="flex items-center gap-3">{content}</div>;
}

function MetaStatsBar({
  recipe,
  totalTime,
}: {
  recipe: { prepTime?: number | null; cookTime?: number | null; servings?: number | null; difficulty?: string | null };
  totalTime: number;
}) {
  return (
    <div className="flex flex-wrap justify-between gap-6 py-5 px-8 rounded-xl surface-muted">
      {recipe.prepTime != null && <MetaStat icon={ClockIcon} label="Prep" value={`${recipe.prepTime}m`} />}
      {recipe.cookTime != null && <MetaStat icon={FireIcon} label="Cook" value={`${recipe.cookTime}m`} />}
      {totalTime > 0 && <MetaStat icon={ClockIcon} label="Total" value={`${totalTime}m`} />}
      {recipe.servings != null && <MetaStat icon={UserGroupIcon} label="Serves" value={`${recipe.servings}`} />}
      {recipe.difficulty && <MetaStat icon={FireIcon} label="Level" value={recipe.difficulty} />}
    </div>
  );
}

function RecipePage() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));

  if (!recipe) throw notFound();

  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <PageLayout>
      <article>
        {recipe.coverImageUrl ? (
          <div className="relative w-full h-[40vh] sm:h-[50vh] lg:h-[60vh] bg-charcoal overflow-hidden">
            <img src={recipe.coverImageUrl} alt={recipe.title} className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            {recipe.videoUrl && (
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-charcoal hover:bg-white transition-colors"
              >
                <PlayIconSolid className="w-4 h-4 text-terracotta" />
                Watch video
              </a>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12">
              <div className="max-w-5xl mx-auto">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-4">
                  {recipe.category ?? "Recipe"}
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight max-w-3xl">
                  {recipe.title}
                </h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-12 pb-6 wrapper max-w-5xl">
            <span className="inline-block px-3 py-1 rounded-full bg-sage/10 text-sage text-xs font-medium mb-4">
              {recipe.category ?? "Recipe"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight max-w-3xl">
              {recipe.title}
            </h1>
          </div>
        )}

        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-b border-subtle">
            <RecipeAuthor author={recipe.author} createdAt={recipe._creationTime} />

            <div className="flex items-center gap-2">
              <BookmarkButton recipeId={recipe._id} />
              <ShareButton title={recipe.title} />
              <Link
                to="/recipe/$slug/print"
                params={{ slug }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-stone hover:text-primary hover:bg-cream-dark dark:hover:bg-d-surface-raised transition-all"
              >
                <PrinterIcon className="w-4 h-4" />
                Print
              </Link>
            </div>
          </div>

          <div className="py-8 space-y-6">
            {recipe.description && (
              <p className="text-lg text-secondary leading-relaxed max-w-2xl">{recipe.description}</p>
            )}

            {(recipe.prepTime != null || recipe.cookTime != null || recipe.servings != null || recipe.difficulty) && (
              <MetaStatsBar recipe={recipe} totalTime={totalTime} />
            )}
          </div>

          <div className="grid lg:grid-cols-[340px_1fr] gap-10 lg:gap-14 pb-16">
            <aside className="lg:self-start">
              <div className="sticky top-24">
                <div className="card p-6">
                  <h2 className="font-serif text-xl font-medium mb-5">Ingredients</h2>
                  <IngredientScaler ingredients={recipe.ingredients} defaultServings={recipe.servings ?? 4} />
                </div>
              </div>
            </aside>

            <section>
              <h2 className="font-serif text-xl font-medium mb-8">Instructions</h2>
              <ol className="space-y-6">
                {recipe.steps.map((step, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: steps may repeat, so value alone is not a unique key
                  <li key={`${step}-${i}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="w-8 h-8 step-number text-sm">{i + 1}</span>
                      {i < recipe.steps.length - 1 && <div className="step-line mt-2" />}
                    </div>
                    <div className="pt-1 pb-2">
                      <p className="text-charcoal-light dark:text-d-text-secondary leading-relaxed">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      </article>
    </PageLayout>
  );
}
