import { BookmarkIcon } from "@heroicons/react/24/outline";
import { useSearch } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Collections } from "@/components/dashboard/Collections";
import { DashboardLoadingSkeleton } from "@/components/dashboard/DashboardLoadingSkeleton";
import { DashboardTabs, type DashboardTab } from "@/components/dashboard/DashboardTabs";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { RecipeListRow } from "@/components/dashboard/RecipeListRow";
import { useConfirmAction } from "@/hooks/useConfirmAction";

const DASHBOARD_TABS: DashboardTab[] = [
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
  let recipes: typeof myRecipes;
  if (tab === "saved") recipes = myBookmarks;
  else if (tab === "collections") recipes = [];
  else recipes = myRecipes;

  if (!user || (tab !== "collections" && recipes === undefined)) {
    return <DashboardLoadingSkeleton />;
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

      <DashboardTabs tabs={DASHBOARD_TABS} activeTab={tab} />

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
