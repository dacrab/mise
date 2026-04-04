import { BookmarkIcon } from "@heroicons/react/24/outline";
import { useSearch, Link } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Collections } from "@/components/dashboard/Collections";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { RecipeListRow } from "@/components/dashboard/RecipeListRow";
import { useConfirmAction } from "@/hooks/useConfirmAction";

const TABS = [
  { id: "my-recipes", label: "My Recipes" },
  { id: "saved", label: "Saved" },
  { id: "collections", label: "Collections" },
];

export function DashboardView() {
  const user = useQuery(api.users.currentUser);
  const myRecipes = useQuery(api.recipes.myRecipes);
  const myBookmarks = useQuery(api.recipes.myBookmarks);
  const deleteRecipe = useMutation(api.recipes.remove);
  const { trigger: handleDelete, pendingId: pendingDelete } = useConfirmAction<Id<"recipes">>(
    async (id) => { await deleteRecipe({ id }); },
    { confirmMessage: "Tap delete again to confirm", successMessage: "Recipe deleted", errorMessage: "Could not delete recipe" }
  );

  const { tab = "my-recipes" } = useSearch({ strict: false }) as { tab?: string };
  const recipes = tab === "saved" ? myBookmarks : tab === "collections" ? [] : myRecipes;

  if (!user || (tab !== "collections" && recipes === undefined)) {
    return (
      <div className="wrapper py-8 animate-pulse">
        <div className="py-8 md:py-12 border-b border-cream-dark mb-8">
          <div className="h-6 w-32 bg-cream-dark rounded mb-3" />
          <div className="h-9 w-64 bg-cream-dark rounded" />
        </div>
        <div className="flex gap-6 mb-8">
          {["My Recipes", "Saved", "Collections"].map((label) => (
            <div key={label} className="h-4 w-20 bg-cream-dark rounded" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="card flex items-center gap-4 p-4">
              <div className="w-16 h-16 rounded-lg bg-cream-dark shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-cream-dark rounded" />
                <div className="h-3 w-1/4 bg-cream-dark rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wrapper py-8">
      <div className="py-8 md:py-12 border-b border-cream-dark mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-hand text-xl text-sage mb-1">your kitchen</p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium">
              Welcome back, {user.name?.split(" ")[0] ?? "Chef"}
            </h1>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="font-serif text-2xl font-medium text-charcoal">{recipes?.length ?? "—"}</p>
              <p className="text-xs text-stone mt-0.5">Recipes</p>
            </div>
            <div className="text-center">
              <p className="font-serif text-2xl font-medium text-charcoal">{myBookmarks?.length ?? "—"}</p>
              <p className="text-xs text-stone mt-0.5">Saved</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex gap-6 mb-8" aria-label="Dashboard sections">
        {TABS.map((tabItem) => (
          <Link
            key={tabItem.id}
            to="/dashboard"
            search={{ tab: tabItem.id }}
            aria-current={tab === tabItem.id ? "page" : undefined}
            className={`text-sm font-medium pb-2 border-b-2 ${tab === tabItem.id ? "border-charcoal text-charcoal" : "border-transparent text-stone hover:text-charcoal-light"}`}
          >
            {tabItem.label}
          </Link>
        ))}
      </nav>

      {tab === "collections" ? (
        <Collections />
      ) : recipes !== undefined && recipes.length === 0 ? (
        <EmptyState
          icon={<BookmarkIcon className="w-6 h-6 text-stone" />}
          title="Nothing here yet"
          message={tab === "saved" ? "Recipes you bookmark will appear here." : "Start by creating your first recipe."}
          actionLabel={tab === "saved" ? undefined : "Create recipe"}
          actionTo={tab === "saved" ? undefined : "/dashboard/create"}
        />
      ) : (
        <div className="space-y-3">
          {(recipes ?? []).map((recipe) => (
            <RecipeListRow
              key={recipe._id}
              recipe={recipe}
              showActions={tab === "my-recipes"}
              pendingDeleteId={pendingDelete}
              onDelete={(id) => void handleDelete(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
