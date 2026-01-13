import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import RecipeEditor from "./RecipeEditor";
import { withConvex } from "../convex";
import type { Id } from "../../convex/_generated/dataModel";

function EditRecipeInner({ recipeId }: { recipeId: Id<"recipes"> }) {
  const recipe = useQuery(api.recipes.getById, { id: recipeId });
  const user = useQuery(api.users.currentUser);

  // Redirect if not logged in
  if (user === null) {
    window.location.href = "/login";
    return null;
  }

  // Loading
  if (recipe === undefined || user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  // Not found or not owner
  if (!recipe || recipe.userId !== user._id) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 mb-4">
        <a
          href="/dashboard"
          className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-brand-text transition-colors"
        >
          Back to Kitchen
        </a>
      </div>
      <RecipeEditor
        initialData={{
          id: recipe._id,
          title: recipe.title,
          description: recipe.description,
          category: recipe.category,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          coverImage: recipe.coverImage,
          coverImageUrl: recipe.coverImageUrl,
          videoUrl: recipe.videoUrl,
          status: recipe.status,
          slug: recipe.slug,
        }}
        isEditing={true}
      />
    </div>
  );
}

export default withConvex(EditRecipeInner);
