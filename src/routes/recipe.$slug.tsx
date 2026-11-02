import { convexQuery } from "@convex-dev/react-query";
import { PrinterIcon, ShareIcon } from "@heroicons/react/24/outline";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { useMemo, useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BookmarkButton } from "@/components/recipe/BookmarkButton";
import { MetaStat } from "@/components/ui/MetaStat";
import { Avatar, LoadingState } from "@/components/ui/Primitives";
import { RouteError } from "@/components/ui/RouteError";
import { useToast } from "@/components/ui/Toast";
import { APP_TITLE_SUFFIX, MAX_SERVINGS, MIN_SERVINGS, SITE_URL } from "@/lib/constants";
import { recipeStats } from "@/lib/recipe";
import { formatDate, scaleIngredient } from "@/lib/utils";

export const Route = createFileRoute("/recipe/$slug")({
  loader: async ({ params, context: { queryClient } }) => {
    const recipe = await queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug }));
    if (recipe && recipe.canonicalSlug !== params.slug) {
      throw redirect({
        to: "/recipe/$slug",
        params: { slug: recipe.canonicalSlug },
        statusCode: 301,
      });
    }
    return recipe;
  },
  component: RecipePage,
  pendingComponent: LoadingState,
  errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
  head: ({ loaderData }) => {
    const canonicalSlug = loaderData?.canonicalSlug;
    const url = canonicalSlug ? `${SITE_URL}/recipe/${canonicalSlug}` : SITE_URL;

    return {
      meta: [
        { title: loaderData?.title ? `${loaderData.title}${APP_TITLE_SUFFIX}` : `Recipe${APP_TITLE_SUFFIX}` },
        { name: "description", content: loaderData?.description ?? "A recipe shared on Mise." },
        { property: "og:title", content: loaderData?.title ?? "Recipe" },
        { property: "og:description", content: loaderData?.description ?? "A recipe shared on Mise." },
        ...(loaderData?.coverImageUrl ? [{ property: "og:image", content: loaderData.coverImageUrl }] : []),
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: canonicalSlug ? [{ rel: "canonical", href: url }] : [],
    };
  },
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
        toast("Link copied", "success");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") toast("Could not share", "error");
    }
  };

  return (
    <button type="button" onClick={() => void handleShare()} className="btn-secondary btn-sm" aria-label="Share">
      <ShareIcon className="size-4" />
      Share
    </button>
  );
}

function IngredientScaler({ ingredients, defaultServings }: { ingredients: string[]; defaultServings: number }) {
  const baseServings = Math.max(MIN_SERVINGS, defaultServings);
  const [servings, setServings] = useState(baseServings);
  const scale = servings / baseServings;
  const scaled = useMemo(
    () => ingredients.map((ingredient) => scaleIngredient(ingredient, scale)),
    [ingredients, scale],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-ink-soft">Servings</span>
        <button
          type="button"
          onClick={() => setServings(Math.max(MIN_SERVINGS, servings - 1))}
          className="icon-btn size-8 border border-line"
          aria-label="Decrease servings"
        >
          −
        </button>
        <input
          type="number"
          min={MIN_SERVINGS}
          max={MAX_SERVINGS}
          value={servings}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(next) && next >= MIN_SERVINGS && next <= MAX_SERVINGS) setServings(next);
          }}
          className="w-12 border-b border-line bg-transparent py-1 text-center text-sm font-medium text-ink outline-none focus:border-accent"
          aria-label="Number of servings"
        />
        <button
          type="button"
          onClick={() => setServings(Math.min(MAX_SERVINGS, servings + 1))}
          className="icon-btn size-8 border border-line"
          aria-label="Increase servings"
        >
          +
        </button>
        {servings !== baseServings && (
          <button type="button" onClick={() => setServings(baseServings)} className="link text-xs">
            Reset
          </button>
        )}
      </div>

      <ul className="mt-6 space-y-3">
        {scaled.map((ingredient, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: ingredients may repeat, so the value alone is not unique
          <li key={`${ingredient}-${index}`} className="flex gap-2.5 border-b border-line pb-3 text-sm last:border-0">
            <span className="mt-0.5 text-accent" aria-hidden="true">
              ·
            </span>
            <span className="leading-relaxed text-ink-soft">{ingredient}</span>
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
    profileImageUrl?: string | null;
  } | null;
  createdAt: number;
}) {
  const content = (
    <>
      <Avatar src={author?.profileImageUrl} name={author?.name ?? "Chef"} size="md" />
      <div>
        <span className="block text-sm font-medium text-ink transition-colors group-hover:text-accent">
          {author?.name ?? "Chef"}
        </span>
        <time className="block text-xs text-muted" dateTime={new Date(createdAt).toISOString()}>
          {formatDate(createdAt)}
        </time>
      </div>
    </>
  );

  if (author?.username) {
    return (
      <Link to="/chef/$username" params={{ username: author.username }} className="group flex items-center gap-3">
        {content}
      </Link>
    );
  }

  return <div className="flex items-center gap-3">{content}</div>;
}

function MetaStatsBar({
  recipe,
}: {
  recipe: { prepTime?: number | null; cookTime?: number | null; servings?: number | null; difficulty?: string | null };
}) {
  const stats = recipeStats(recipe);

  if (stats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface px-4 py-5">
          <MetaStat icon={stat.icon} label={stat.label} value={stat.value} />
        </div>
      ))}
    </div>
  );
}

function RecipePage() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));

  if (!recipe) throw notFound();

  return (
    <PageLayout>
      <article>
        {recipe.coverImageUrl ? (
          <div className="relative min-h-[380px] w-full overflow-hidden bg-black sm:h-[52vh]">
            <img src={recipe.coverImageUrl} alt={recipe.title} className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
            {recipe.videoUrl && (
              <a
                href={recipe.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-black backdrop-blur-sm transition-colors hover:bg-white"
              >
                <PlayIcon className="size-4 text-clay" />
                Watch video
              </a>
            )}
            <div className="absolute inset-x-0 bottom-0">
              <div className="container-page pb-10">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  {recipe.category}
                </span>
                <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.02] text-white text-balance sm:text-5xl lg:text-6xl">
                  {recipe.title}
                </h1>
              </div>
            </div>
          </div>
        ) : (
          <div className="container-page pt-14 pb-8">
            <span className="badge badge-accent">{recipe.category}</span>
            <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-[1.02] text-balance sm:text-5xl lg:text-6xl">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{recipe.description}</p>
            )}
          </div>
        )}

        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-5">
            <RecipeAuthor author={recipe.author} createdAt={recipe._creationTime} />
            <div className="flex flex-wrap items-center gap-2">
              <BookmarkButton recipeId={recipe._id} />
              <ShareButton title={recipe.title} />
              <Link to="/recipe/$slug/print" params={{ slug }} className="btn-secondary btn-sm">
                <PrinterIcon className="size-4" />
                Print
              </Link>
            </div>
          </div>

          <div className="py-8">
            {recipe.coverImageUrl && recipe.description && (
              <p className="mb-7 max-w-2xl text-lg leading-relaxed text-ink-soft">{recipe.description}</p>
            )}
            <MetaStatsBar recipe={recipe} />
          </div>

          <div className="grid gap-10 pb-20 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:self-start">
              <div className="card sticky top-24 p-6">
                <h2 className="text-xl font-medium">Ingredients</h2>
                <div className="mt-5">
                  <IngredientScaler ingredients={recipe.ingredients} defaultServings={recipe.servings ?? 4} />
                </div>
              </div>
            </aside>

            <section>
              <h2 className="text-xl font-medium">Instructions</h2>
              <ol className="mt-6 space-y-6">
                {recipe.steps.map((step, index) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: steps may repeat, so the value alone is not unique
                  <li key={`${step}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="step-number">{index + 1}</span>
                      {index < recipe.steps.length - 1 && <div className="step-line mt-2" />}
                    </div>
                    <p className="pt-1.5 pb-2 leading-relaxed text-ink-soft">{step}</p>
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
