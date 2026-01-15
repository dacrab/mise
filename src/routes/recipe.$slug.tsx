import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { PageLayout } from "@/components/ui/Layout";
import { SocialActions } from "@/components/social/SocialActions";
import { CommentSection } from "@/components/social/CommentSection";
import { CookingNow } from "@/components/recipe/CookingNow";

export const Route = createFileRoute("/recipe/$slug")({
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
    <PageLayout headerVariant="minimal" backLink={{ href: "/", label: "Recipes" }}>
      <article className="wrapper max-w-4xl">
        <header className="py-12 md:py-16">
          <div className="flex items-center gap-4 mb-4">
            <span className="tag-sage">{recipe.category || "Recipe"}</span>
            <CookingNow recipeId={recipe._id} />
          </div>
          <h1 className="heading-1 text-3xl sm:text-4xl md:text-5xl mb-4">{recipe.title}</h1>
          {recipe.description && <p className="body-large max-w-2xl">{recipe.description}</p>}
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
              <a href={recipe.videoUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 btn-primary text-sm">▶ Watch video</a>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12">
          <aside>
            <div className="card p-6 sticky top-24">
              <h3 className="font-serif text-lg font-medium mb-4">Ingredients</h3>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage mt-2 shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>
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
            <div className="mt-12 pt-8 border-t border-cream-dark flex items-center justify-between">
              <SocialActions recipeId={recipe._id} slug={slug} />
              <Link to="/recipe/$slug/print" params={{ slug }} className="text-sm text-stone hover:text-sage flex items-center gap-1">
                🖨️ Print
              </Link>
            </div>
            <div className="mt-12">
              <CommentSection recipeId={recipe._id} isLoggedIn={!!user} />
            </div>
          </section>
        </div>
      </article>
    </PageLayout>
  );
}
