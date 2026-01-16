
import { useQuery, useMutation } from "convex/react";
import { Link, useSearch } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useToast } from "@/components/ui/toast";
import { Collections } from "@/components/recipe/Collections";
import { BookmarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

export function Dashboard() {
  const { toast } = useToast();
  const user = useQuery(api.users.currentUser);
  const myRecipes = useQuery(api.recipes.myRecipes);
  const myBookmarks = useQuery(api.recipes.myBookmarks);
  const deleteRecipe = useMutation(api.recipes.remove);

  const { tab = "my-recipes" } = useSearch({ strict: false }) as { tab?: string };
  const recipes = tab === "saved" ? myBookmarks : tab === "collections" ? [] : myRecipes;

  if (!user || (tab !== "collections" && recipes === undefined)) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading...</div>;
  }

  const handleDelete = async (id: Id<"recipes">) => {
    if (!confirm("Delete this recipe?")) return;
    try {
      await deleteRecipe({ id });
      toast("Recipe deleted", "success");
    } catch {
      toast("Could not delete recipe", "error");
    }
  };

  return (
    <div className="wrapper py-8">
      <div className="py-8 md:py-12 border-b border-cream-dark mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-hand text-xl text-sage mb-1">your kitchen</p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium">Welcome back, {user.name?.split(" ")[0] || "Chef"}</h1>
          </div>
        </div>
      </div>

      <nav className="flex gap-6 mb-8" role="tablist">
        {[
          { id: "my-recipes", label: "My Recipes" },
          { id: "saved", label: "Saved" },
          { id: "collections", label: "Collections" },
        ].map((t) => (
          <Link
            key={t.id}
            to="/dashboard"
            search={{ tab: t.id }}
            className={`text-sm font-medium pb-2 border-b-2 ${tab === t.id ? "border-charcoal text-charcoal" : "border-transparent text-stone hover:text-charcoal-light"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "collections" ? (
        <Collections />
      ) : (recipes?.length ?? 0) === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <BookmarkIcon className="w-6 h-6 text-stone" />
          </div>
          <h2 className="font-serif text-xl font-medium mb-2">Nothing here yet</h2>
          <p className="text-stone text-sm mb-6">{tab === "saved" ? "Recipes you bookmark will appear here." : "Start by creating your first recipe."}</p>
          {tab !== "saved" && <Link to="/dashboard/create" className="btn-primary text-sm">Create recipe</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {(recipes ?? []).map((r) => (
            <div key={r._id} className="card-hover flex items-center gap-4 p-4 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-cream-dark shrink-0">
                {r.coverImageUrl ? <img src={r.coverImageUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><PhotoIcon className="w-6 h-6 text-stone-light" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-serif text-lg font-medium truncate group-hover:text-sage">{r.title}</h3>
                  {r.status === "draft" && <span className="tag text-[10px] bg-honey/20 text-honey">Draft</span>}
                </div>
                <Link to="/recipe/$slug" params={{ slug: r.slug }} className="text-xs text-stone hover:text-sage">View →</Link>
              </div>
              {tab === "my-recipes" && (
                <div className="flex gap-2">
                  <a href={`/dashboard/edit/${r._id}`} className="btn-ghost text-xs py-1.5 px-3">Edit</a>
                  <button onClick={() => handleDelete(r._id)} className="btn-ghost text-xs py-1.5 px-3 text-terracotta">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
