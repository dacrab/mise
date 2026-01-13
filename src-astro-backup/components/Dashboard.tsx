import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { withConvex } from "../convex";
import type { Id } from "../../convex/_generated/dataModel";

function DashboardInner() {
  const user = useQuery(api.users.currentUser);
  const myRecipes = useQuery(api.recipes.myRecipes);
  const myBookmarks = useQuery(api.recipes.myBookmarks);
  const deleteRecipe = useMutation(api.recipes.remove);
  const { signOut } = useAuthActions();

  const activeTab = new URLSearchParams(window.location.search).get("tab") || "my-recipes";
  const recipesToShow = activeTab === "saved" ? myBookmarks : myRecipes;

  if (user === null) {
    window.location.href = "/login";
    return null;
  }

  if (user === undefined || recipesToShow === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-stone animate-pulse">Loading...</div>
      </div>
    );
  }

  const handleDelete = async (id: Id<"recipes">) => {
    if (!confirm("Delete this recipe permanently?")) return;
    try {
      await deleteRecipe({ id });
    } catch {
      alert("Failed to delete recipe.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <main className="pt-20 pb-24 min-h-screen">
      <div className="wrapper">
        {/* Header */}
        <div className="py-8 md:py-12 border-b border-cream-dark mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-hand text-xl text-sage mb-1">your kitchen</p>
              <h1 className="font-serif text-3xl md:text-4xl font-medium">
                Welcome back, {user.name?.split(" ")[0] || "Chef"}
              </h1>
            </div>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="btn-ghost text-sm">
                Sign out
              </button>
              <a href="/dashboard/create" className="btn-primary text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New recipe
              </a>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mb-8">
          {[
            { id: "my-recipes", label: "My Recipes" },
            { id: "saved", label: "Saved" },
          ].map((tab) => (
            <a
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-charcoal text-charcoal"
                  : "border-transparent text-stone hover:text-charcoal-light"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Recipe List */}
        {recipesToShow.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-14 h-14 bg-cream-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="text-stone" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </div>
            <h2 className="font-serif text-xl font-medium mb-2">Nothing here yet</h2>
            <p className="text-stone text-sm mb-6">
              {activeTab === "saved"
                ? "Recipes you bookmark will appear here."
                : "Start by creating your first recipe."}
            </p>
            {activeTab !== "saved" && (
              <a href="/dashboard/create" className="btn-primary text-sm">Create recipe</a>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recipesToShow.map((recipe) => (
              <div
                key={recipe._id}
                className="card-hover flex items-center gap-4 p-4 group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-cream-dark shrink-0">
                  {recipe.coverImageUrl ? (
                    <img src={recipe.coverImageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-light">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-lg font-medium truncate group-hover:text-sage transition-colors">
                      {recipe.title}
                    </h3>
                    {recipe.status === "draft" && (
                      <span className="tag text-[10px] bg-honey/20 text-honey">Draft</span>
                    )}
                  </div>
                  <a
                    href={`/recipe/${recipe.slug}`}
                    className="text-xs text-stone hover:text-sage transition-colors"
                  >
                    View recipe →
                  </a>
                </div>

                {activeTab === "my-recipes" && (
                  <div className="flex gap-2">
                    <a href={`/dashboard/edit/${recipe._id}`} className="btn-ghost text-xs py-1.5 px-3">
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(recipe._id)}
                      className="btn-ghost text-xs py-1.5 px-3 text-terracotta hover:text-terracotta-light"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default withConvex(DashboardInner);
