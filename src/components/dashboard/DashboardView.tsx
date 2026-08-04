import { BookmarkIcon, BookOpenIcon, PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Link, useSearch } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { useBookmarks } from "@/lib/bookmarks";

function RecipeListRow({
  recipe,
  showActions = false,
  pendingDeleteId,
  onDelete,
}: {
  recipe: {
    _id: Id<"recipes">;
    slug: string;
    title: string;
    coverImageUrl?: string | null;
    status?: "draft" | "published";
  };
  showActions?: boolean;
  pendingDeleteId?: Id<"recipes"> | null;
  onDelete?: (id: Id<"recipes">) => void;
}) {
  return (
    <div className="card-hover flex items-center gap-4 p-4 group">
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden surface-raised shrink-0">
        {recipe.coverImageUrl ? (
          <img src={recipe.coverImageUrl} className="w-full h-full object-cover" alt="" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PhotoIcon className="w-6 h-6 text-stone-light" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-serif text-lg font-medium truncate group-hover:text-sage">{recipe.title}</h3>
          {recipe.status === "draft" && <span className="tag text-[10px] bg-honey/20 text-honey">Draft</span>}
        </div>
        <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="text-xs text-stone hover:text-sage">
          View →
        </Link>
      </div>
      {showActions && onDelete && (
        <div className="flex gap-2">
          <Link to="/dashboard/edit/$id" params={{ id: recipe._id }} className="btn-ghost text-xs py-1.5 px-3">
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(recipe._id)}
            className={`btn-ghost text-xs py-1.5 px-3 text-terracotta ${pendingDeleteId === recipe._id ? "font-semibold" : ""}`}
          >
            {pendingDeleteId === recipe._id ? "Confirm?" : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "my-recipes", label: "My Recipes", icon: BookOpenIcon },
  { id: "saved", label: "Saved", icon: BookmarkIcon },
];

function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-8 animate-pulse">
      <div className="py-8 md:py-12 mb-8">
        <div className="h-5 w-24 surface-muted rounded mb-3" />
        <div className="h-9 w-64 surface-muted rounded mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 space-y-2">
              <div className="h-8 w-12 surface-muted rounded" />
              <div className="h-3 w-16 surface-muted rounded" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card flex items-center gap-4 p-4">
            <div className="w-16 h-16 rounded-lg surface-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 surface-muted rounded" />
              <div className="h-3 w-1/4 surface-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardView() {
  const user = useQuery(api.users.currentUser);
  const myRecipes = useQuery(api.recipes.myRecipes);
  const { bookmarks: myBookmarks } = useBookmarks();
  const deleteRecipe = useMutation(api.recipes.remove);
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Id<"recipes"> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleDelete = async (id: Id<"recipes">) => {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      toast("Tap delete again to confirm", "info");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setPendingDelete(null), 3000);
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    setPendingDelete(null);
    try {
      await deleteRecipe({ id });
      toast("Recipe deleted", "success");
    } catch {
      toast("Could not delete recipe", "error");
    }
  };

  const { tab = "my-recipes" } = useSearch({ from: "/_authed/dashboard/" });
  const isSavedTab = tab === "saved";
  const recipes = isSavedTab ? myBookmarks : myRecipes;

  if (user === undefined || myRecipes === undefined || myBookmarks === undefined) {
    return <DashboardSkeleton />;
  }

  const publishedCount = myRecipes.filter((r) => r.status === "published").length;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="py-8 md:py-12 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div>
            <p className="font-hand text-xl text-sage mb-1">your kitchen</p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium">
              Welcome back, {user?.name?.split(" ")[0] ?? "Chef"}
            </h1>
          </div>
          <Link to="/dashboard/create" className="btn-primary flex items-center gap-2 text-sm shrink-0">
            <PlusIcon className="w-4 h-4" />
            New Recipe
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="font-serif text-3xl font-medium text-primary">{myRecipes.length}</p>
            <p className="text-sm text-stone mt-1">Total Recipes</p>
          </div>
          <div className="card p-5">
            <p className="font-serif text-3xl font-medium text-sage">{publishedCount}</p>
            <p className="text-sm text-stone mt-1">Published</p>
          </div>
          <div className="card p-5 col-span-2 sm:col-span-1">
            <p className="font-serif text-3xl font-medium text-primary">{myBookmarks.length}</p>
            <p className="text-sm text-stone mt-1">Bookmarked</p>
          </div>
        </div>
      </div>

      <nav className="flex gap-1 mb-8 border-b border-subtle" aria-label="Dashboard sections">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon;
          const active = tab === tabItem.id;
          return (
            <Link
              key={tabItem.id}
              to="/dashboard"
              search={{ tab: tabItem.id }}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active
                  ? "border-sage text-sage"
                  : "border-transparent text-stone hover:text-charcoal dark:hover:text-d-text"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tabItem.label}
              <span className="text-xs surface-muted px-2 py-0.5 rounded-full">
                {(tabItem.id === "saved" ? myBookmarks : myRecipes).length}
              </span>
            </Link>
          );
        })}
      </nav>

      {!recipes || recipes.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-20 h-20 bg-sage/10 rounded-full flex items-center justify-center mx-auto mb-6">
            {isSavedTab ? (
              <BookmarkIcon className="w-9 h-9 text-sage" />
            ) : (
              <BookOpenIcon className="w-9 h-9 text-sage" />
            )}
          </div>
          <h2 className="font-serif text-2xl font-medium mb-2">
            {isSavedTab ? "Your bookshelf is empty" : "Start your recipe collection"}
          </h2>
          <p className="text-stone max-w-sm mx-auto mb-8">
            {isSavedTab
              ? "When you find recipes you love, bookmark them and they'll be waiting here."
              : "Every great chef starts with one recipe. Share yours with the world."}
          </p>
          {!isSavedTab && (
            <Link to="/dashboard/create" className="btn-primary inline-flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Create your first recipe
            </Link>
          )}
          {isSavedTab && (
            <Link to="/" className="btn-secondary inline-flex items-center gap-2 text-sm">
              Browse recipes
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {recipes.map((recipe) => (
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
