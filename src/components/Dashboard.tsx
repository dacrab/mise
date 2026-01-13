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

  // Redirect if not logged in
  if (user === null) {
    window.location.href = "/login";
    return null;
  }

  // Loading state
  if (user === undefined || recipesToShow === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  const handleDelete = async (id: Id<"recipes">) => {
    if (!confirm("Delete this recipe permanently?")) return;
    try {
      await deleteRecipe({ id });
    } catch {
      alert("Operation failed.");
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <main className="pt-24 pb-20 min-h-screen bg-gray-50/30">
      <div className="wrapper">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-serif">Kitchen Control</h1>
            <p className="text-gray-500">Manage your published masterpieces and bookmarks.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleLogout} className="btn-ghost text-sm">
              Sign Out
            </button>
            <a href="/dashboard/create" className="btn-primary flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              New Recipe
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {[
            { id: "my-recipes", label: "My Recipes" },
            { id: "saved", label: "Saved Bookmarks" },
          ].map((tab) => (
            <a
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-brand-primary text-brand-primary"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Recipe List */}
        {recipesToShow.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-gray-200 rounded-3xl bg-white shadow-sm text-center">
            <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mb-6 text-brand-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-serif mb-2">Nothing here yet</h2>
            <p className="text-gray-500 max-w-sm">
              {activeTab === "saved"
                ? "You haven't bookmarked any recipes yet."
                : "You haven't published any recipes yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recipesToShow.map((recipe) => (
              <div
                key={recipe._id}
                className="flex items-center gap-6 p-4 md:p-6 bg-white border border-brand-border rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                  {recipe.coverImageUrl ? (
                    <img src={recipe.coverImageUrl} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-accent/30 text-brand-primary/40">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                      </svg>
                    </div>
                  )}
                  {recipe.status === "draft" && (
                    <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                      Draft
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold font-serif truncate group-hover:text-brand-primary transition-colors">
                    {recipe.title}
                  </h3>
                  <a
                    href={`/recipe/${recipe.slug}`}
                    className="text-xs font-bold text-gray-400 hover:text-brand-text flex items-center gap-1 mt-2"
                  >
                    View Recipe
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" x2="21" y1="14" y2="3" />
                    </svg>
                  </a>
                </div>

                {activeTab === "my-recipes" && (
                  <div className="flex flex-col md:flex-row gap-2 ml-4">
                    <a href={`/dashboard/edit/${recipe._id}`} className="btn-outline text-xs px-4 py-2">
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(recipe._id)}
                      className="btn-ghost text-xs px-4 py-2 text-red-400 hover:text-red-600"
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
