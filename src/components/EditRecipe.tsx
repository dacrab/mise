import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import RecipeEditor from "./RecipeEditor";
import { withConvex } from "../convex";
import type { Id } from "../../convex/_generated/dataModel";

function EditRecipeInner({ recipeId }: { recipeId: Id<"recipes"> }) {
  const recipe = useQuery(api.recipes.getById, { id: recipeId });
  const user = useQuery(api.users.currentUser);

  if (user === null) {
    window.location.href = "/login";
    return null;
  }

  if (recipe === undefined || user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-stone animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!recipe || recipe.userId !== user._id) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-cream">
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
