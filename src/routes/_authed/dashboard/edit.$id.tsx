import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/edit/$id")({
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const recipe = useQuery(api.recipes.getById, { id: id as Id<"recipes"> });
  const user = useQuery(api.users.currentUser);

  if (user === undefined || recipe === undefined) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading...</div>;
  }

  if (user === null) {
    navigate({ to: "/login" });
    return null;
  }

  if (!recipe || recipe.userId !== user._id) {
    navigate({ to: "/dashboard" });
    return null;
  }

  return (
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
      }}
      isEditing
    />
  );
}
