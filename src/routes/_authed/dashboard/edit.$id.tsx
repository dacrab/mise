import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/edit/$id")({
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const recipeResult = useQuery(api.recipes.getById, { id: id as Id<"recipes"> });
  const userResult = useQuery(api.users.currentUser);

  // Convex useQuery returns undefined (loading) | null (not found) | data.
  // Destructure to primitives so the eslint @tanstack/query/no-unstable-deps
  // rule is satisfied — we only depend on the stable scalar values.
  const userIsNull = userResult === null;
  const userId = userResult?._id;
  const recipeUserId = recipeResult?.userId;
  const recipeLoaded = recipeResult !== undefined;
  const userLoaded = userResult !== undefined;

  // Redirects must happen in effects, never during render
  useEffect(() => {
    if (userIsNull) {
      void navigate({ to: "/login", replace: true });
    }
  }, [userIsNull, navigate]);

  // recipeExists is a stable boolean derived from the query result
  const recipeExists = !!recipeResult;

  useEffect(() => {
    if (userLoaded && recipeLoaded) {
      if (!recipeExists || recipeUserId !== userId) {
        void navigate({ to: "/dashboard", replace: true });
      }
    }
  }, [userLoaded, recipeLoaded, recipeExists, recipeUserId, userId, navigate]);

  const recipe = recipeResult;
  const user = userResult;

  if (user === undefined || recipe === undefined) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }

  if (user === null || !recipe || recipe.userId !== user._id) {
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
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
      }}
      isEditing
    />
  );
}
