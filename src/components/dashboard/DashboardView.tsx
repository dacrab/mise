import { BookmarkIcon, BookOpenIcon, PencilSquareIcon, PhotoIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Link, useSearch } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { useBookmarks } from "@/lib/bookmarks";
import { formatShortDate } from "@/lib/utils";

type DashboardRecipe = {
  _id: Id<"recipes">;
  slug: string;
  title: string;
  coverImageUrl?: string | null;
  status?: "draft" | "published";
  updatedAt?: number | null;
};

function RecipeRow({
  recipe,
  showActions,
  pendingDeleteId,
  onDelete,
}: {
  recipe: DashboardRecipe;
  showActions: boolean;
  pendingDeleteId: Id<"recipes"> | null;
  onDelete: (id: Id<"recipes">) => void;
}) {
  const isPending = pendingDeleteId === recipe._id;

  return (
    <article className="card flex items-center gap-4 p-3 sm:p-4">
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:size-20">
        {recipe.coverImageUrl ? (
          <img src={recipe.coverImageUrl} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <PhotoIcon className="size-6 text-line-strong" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate font-display text-lg font-medium">
            <Link to="/recipe/$slug" params={{ slug: recipe.slug }} className="hover:text-accent">
              {recipe.title}
            </Link>
          </h2>
          {recipe.status === "draft" && <span className="badge badge-clay">Draft</span>}
        </div>
        <p className="mt-1 text-xs text-muted">
          {recipe.updatedAt ? `Updated ${formatShortDate(recipe.updatedAt)}` : "Not updated yet"}
        </p>
      </div>

      {showActions && (
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/dashboard/edit/$id"
            params={{ id: recipe._id }}
            className="icon-btn"
            aria-label={`Edit ${recipe.title}`}
          >
            <PencilSquareIcon className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => onDelete(recipe._id)}
            className={`btn-sm btn rounded-lg border transition-colors ${
              isPending
                ? "border-clay bg-clay text-canvas"
                : "border-line text-clay hover:border-clay/40 hover:bg-clay-soft"
            }`}
          >
            {isPending ? "Confirm delete" : "Delete"}
          </button>
        </div>
      )}
    </article>
  );
}

const TABS = [
  { id: "my-recipes", label: "My recipes", icon: BookOpenIcon },
  { id: "saved", label: "Saved", icon: BookmarkIcon },
] as const;

function DashboardSkeleton() {
  return (
    <div className="container-page animate-pulse py-10 md:py-14">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton mt-3 h-10 w-72" />
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="card p-5">
            <div className="skeleton h-9 w-14" />
            <div className="skeleton mt-3 h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="mt-10 space-y-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card flex items-center gap-4 p-4">
            <div className="skeleton size-16 shrink-0 rounded-xl sm:size-20" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-5 w-2/3" />
              <div className="skeleton h-3 w-1/4" />
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
  const { bookmarks } = useBookmarks();
  const deleteRecipe = useMutation(api.recipes.remove);
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Id<"recipes"> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { tab = "my-recipes" } = useSearch({ from: "/_authed/dashboard/" });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const handleDelete = async (id: Id<"recipes">) => {
    if (pendingDelete !== id) {
      setPendingDelete(id);
      toast("Press delete again to confirm", "info");
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

  if (user === undefined || myRecipes === undefined || bookmarks === undefined) {
    return <DashboardSkeleton />;
  }

  const isSavedTab = tab === "saved";
  const recipes = isSavedTab ? bookmarks : myRecipes;
  const publishedCount = myRecipes.filter((recipe) => recipe.status === "published").length;

  const stats = [
    { label: "Recipes", value: myRecipes.length },
    { label: "Published", value: publishedCount },
    { label: "Saved", value: bookmarks.length },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Your kitchen</p>
          <h1 className="mt-2 text-4xl font-medium sm:text-5xl">
            Welcome back, {user?.name?.split(" ")[0] ?? user?.username ?? "Chef"}
          </h1>
        </div>
        <Link to="/dashboard/create" className="btn-primary shrink-0">
          <PlusIcon className="size-4" />
          New recipe
        </Link>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <p className="font-display text-4xl font-medium text-ink">{stat.value}</p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <nav className="mt-12 flex gap-7 border-b border-line" aria-label="Dashboard sections">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <Link
              key={id}
              to="/dashboard"
              search={{ tab: id }}
              aria-current={active ? "page" : undefined}
              className={`-mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon className="size-4" />
              {label}
              <span className="badge">{id === "saved" ? bookmarks.length : myRecipes.length}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8">
        {recipes.length === 0 ? (
          <EmptyState
            icon={isSavedTab ? BookmarkIcon : BookOpenIcon}
            title={isSavedTab ? "Nothing saved yet" : "Start your recipe collection"}
            description={
              isSavedTab
                ? "Bookmark recipes you love and they'll be waiting for you here."
                : "Every great cook starts with one recipe. Share yours with the community."
            }
          >
            <Link to={isSavedTab ? "/" : "/dashboard/create"} className="btn-primary">
              {isSavedTab ? "Browse recipes" : "Create your first recipe"}
            </Link>
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <RecipeRow
                key={recipe._id}
                recipe={recipe}
                showActions={!isSavedTab}
                pendingDeleteId={pendingDelete}
                onDelete={(id) => void handleDelete(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
