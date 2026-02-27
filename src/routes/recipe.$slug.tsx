import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { PageLayout } from "@/components/layout";
import { SocialActions, ForkButton, StarRating } from "@/components/social/SocialActions";
import { CommentSection } from "@/components/social/CommentSection";
import { CookingNow, CookingTimers } from "@/components/recipe/RecipeWidgets";
import { IngredientScaler } from "@/components/recipe/IngredientScaler";
import { RecipeCard } from "@/components/ui/RecipeCard";
import { useToast } from "@/components/ui/toast";
import { ClockIcon, FireIcon, UserGroupIcon, PrinterIcon, ShareIcon, FolderPlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { PlayIcon as PlayIconSolid } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";

function AddToCollectionButton({ recipeId }: { recipeId: Id<"recipes"> }) {
  const { toast } = useToast();
  const collections = useQuery(api.collections.list);
  const toggleBookmark = useMutation(api.social.toggleBookmark);
  const bookmarks = useQuery(api.recipes.myBookmarks);
  const currentUser = useQuery(api.users.currentUser);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!currentUser) return null;

  const isBookmarked = bookmarks?.some((r) => r._id === recipeId) ?? false;

  const handleToggle = async (collectionId?: Id<"collections">) => {
    setPending(collectionId ?? "none");
    try {
      await toggleBookmark({ recipeId, collectionId });
      toast(collectionId ? "Collection updated!" : "Saved to bookmarks!", "success");
      setOpen(false);
    } catch {
      toast("Could not save recipe", "error");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm text-stone hover:text-sage transition-colors"
        aria-label="Save to collection"
      >
        <FolderPlusIcon className="w-4 h-4" />
        {isBookmarked ? "Saved" : "Save"}
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-56 bg-warm-white rounded-xl shadow-hover border border-cream-dark py-1 z-20 animate-scale-in origin-bottom-right">
          <p className="px-3 py-2 text-xs font-medium text-stone uppercase tracking-wide">Save to…</p>
          <button
            onClick={() => void handleToggle(undefined)}
            disabled={!!pending}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream-dark transition-colors text-left"
          >
            {isBookmarked ? <CheckIcon className="w-4 h-4 text-sage shrink-0" /> : <div className="w-4" />}
            Bookmarks
          </button>
          {collections?.map((col) => (
            <button
              key={col._id}
              onClick={() => void handleToggle(col._id)}
              disabled={!!pending}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-cream-dark transition-colors text-left"
            >
              <div className="w-4" />
              {col.name}
              <span className="ml-auto text-xs text-stone">{col.count}</span>
            </button>
          ))}
          {collections?.length === 0 && (
            <p className="px-3 py-2 text-xs text-stone">No collections yet. Create one in your dashboard.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ShareButton({ title }: { title: string }) {
  const { toast } = useToast();
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); }
      else { await navigator.clipboard.writeText(url); toast("Link copied!", "success"); }
    } catch (err) { if (err instanceof Error && err.name !== "AbortError") toast("Could not share", "error"); }
  };
  return <button onClick={() => void handleShare()} className="flex items-center gap-1.5 text-sm text-stone hover:text-sage transition-colors" aria-label="Share"><ShareIcon className="w-4 h-4" />Share</button>;
}

function MetaStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 bg-cream-dark rounded-xl text-center">
      <div className="text-stone">{icon}</div>
      <span className="text-xs text-stone uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-charcoal">{value}</span>
    </div>
  );
}

function RelatedRecipes({ recipeId }: { recipeId: Id<"recipes"> }) {
  const related = useQuery(api.discovery.recommendations, { limit: 4 });
  const filtered = related?.filter((r) => r._id !== recipeId).slice(0, 3);
  if (!filtered?.length) return null;
  return (
    <section className="wrapper max-w-4xl pb-16">
      <h2 className="font-serif text-2xl font-medium mb-6">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {filtered.map((r) => <RecipeCard key={r._id} recipeId={r._id} slug={r.slug} title={r.title} category={r.category} coverImageUrl={r.coverImageUrl} />)}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/recipe/$slug")({
  loader: ({ params, context: { queryClient } }) =>
    queryClient.ensureQueryData(
      convexQuery(api.recipes.getBySlug, { slug: params.slug })
    ),
  component: RecipePage,
  head: ({ loaderData }) => {
    const recipe = loaderData as { title?: string; description?: string; coverImageUrl?: string } | undefined;
    return {
      meta: [
        { title: recipe?.title ? `${recipe.title} | Mise` : "Recipe | Mise" },
        { name: "description", content: recipe?.description || "A delicious recipe on Mise" },
        { property: "og:title", content: recipe?.title || "Recipe" },
        { property: "og:description", content: recipe?.description || "A delicious recipe on Mise" },
        { property: "og:image", content: recipe?.coverImageUrl || "" },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
});

function RecipePage() {
  const { slug } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));
  const user = useQuery(api.users.currentUser);

  if (!recipe) throw notFound();

  return (
    <PageLayout>
      <article className="wrapper max-w-4xl">
        <header className="py-12 md:py-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="tag-sage">{recipe.category || "Recipe"}</span>
            <CookingNow recipeId={recipe._id} />
          </div>
          <h1 className="heading-1 text-3xl sm:text-4xl md:text-5xl mb-4">{recipe.title}</h1>
          {recipe.description && <p className="body-large max-w-2xl">{recipe.description}</p>}

          {(recipe.prepTime || recipe.cookTime || recipe.servings || recipe.difficulty) && (
            <div className="flex flex-wrap gap-3 mt-6">
              {recipe.prepTime && <MetaStat icon={<ClockIcon className="w-4 h-4" />} label="Prep" value={`${recipe.prepTime} min`} />}
              {recipe.cookTime && <MetaStat icon={<FireIcon className="w-4 h-4" />} label="Cook" value={`${recipe.cookTime} min`} />}
              {recipe.prepTime && recipe.cookTime && <MetaStat icon={<ClockIcon className="w-4 h-4" />} label="Total" value={`${recipe.prepTime + recipe.cookTime} min`} />}
              {recipe.servings && <MetaStat icon={<UserGroupIcon className="w-4 h-4" />} label="Servings" value={String(recipe.servings)} />}
              {recipe.difficulty && <MetaStat icon={<FireIcon className="w-4 h-4" />} label="Difficulty" value={recipe.difficulty} />}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-cream-dark">
            <Link to="/chef/$username" params={{ username: recipe.author?.username || recipe.author?.name || "unknown" }} className="flex items-center gap-3 group">
              {recipe.author?.image ? (
                <img src={recipe.author.image} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-cream-dark" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sage/15 flex items-center justify-center text-sage font-medium">{(recipe.author?.name || "U")[0]}</div>
              )}
              <div>
                <span className="block text-sm font-medium text-charcoal group-hover:text-sage">{recipe.author?.name || "Community Chef"}</span>
                <span className="block text-xs text-stone">View kitchen →</span>
              </div>
            </Link>
            <span className="text-stone-light">·</span>
            <time className="text-sm text-stone">{new Date(recipe._creationTime).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</time>
          </div>
        </header>

        {recipe.coverImageUrl && (
          <div className="rounded-2xl overflow-hidden aspect-video bg-cream-dark mb-12 relative">
            <img src={recipe.coverImageUrl} alt={recipe.title} className="w-full h-full object-cover" />
            {recipe.videoUrl && (
              <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 btn-primary text-sm flex items-center gap-1.5">
                  <PlayIconSolid className="w-4 h-4" />
                  Watch video
                </a>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">
          <aside className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h3 className="font-serif text-lg font-medium mb-4">Ingredients</h3>
              <IngredientScaler 
                ingredients={recipe.ingredients} 
                defaultServings={recipe.servings || 4} 
              />
            </div>
            <CookingTimers />
          </aside>

          <section>
            <h3 className="font-serif text-lg font-medium mb-6">Instructions</h3>
            <ol className="space-y-6">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-charcoal text-cream text-sm font-medium flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-charcoal-light leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 pt-8 border-t border-cream-dark">
              <div className="flex items-center justify-between mb-6">
                <SocialActions recipeId={recipe._id} slug={slug} />
                <div className="flex items-center gap-2 flex-wrap">
                  <ShareButton title={recipe.title} />
                  <AddToCollectionButton recipeId={recipe._id} />
                  {user && <ForkButton recipeId={recipe._id} recipeTitle={recipe.title} />}
                  <Link to="/recipe/$slug/print" params={{ slug }} className="flex items-center gap-1.5 text-sm text-stone hover:text-sage">
                    <PrinterIcon className="w-4 h-4" />
                    Print
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone">Rate this recipe</span>
                <StarRating recipeId={recipe._id} />
              </div>
            </div>
            <div className="mt-12">
              <CommentSection recipeId={recipe._id} />
            </div>
          </section>
        </div>
      </article>
      <RelatedRecipes recipeId={recipe._id} />
    </PageLayout>
  );
}
