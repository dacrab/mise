import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

/**
 * Convex document IDs are url-safe base64 strings (22 chars today). The
 * server's `v.id("recipes")` validator remains the authority — this guard
 * only fails fast on obviously malformed URL params so users land back on
 * the dashboard instead of an error boundary.
 */
const RECIPE_ID_PATTERN = /^[A-Za-z0-9_-]{22,32}$/;

function isRecipeId(id: string): id is Id<"recipes"> {
  return RECIPE_ID_PATTERN.test(id);
}

export const Route = createFileRoute("/_authed/dashboard/edit/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    if (!isRecipeId(params.id)) throw redirect({ to: "/dashboard", replace: true });
    const recipe = await queryClient.ensureQueryData(convexQuery(api.recipes.getById, { id: params.id }));
    if (!recipe) throw redirect({ to: "/dashboard", replace: true });
  },
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  if (!isRecipeId(id)) return <Navigate to="/dashboard" replace />;
  return <EditRecipeForm id={id} />;
}

function EditRecipeForm({ id }: { id: Id<"recipes"> }) {
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getById, { id }));
  if (!recipe) return null;
  return (
    <RecipeEditor
      initialData={{
        id: recipe._id,
        title: recipe.title,
        description: recipe.description,
        coverImage: recipe.coverImage,
        coverImageUrl: recipe.coverImageUrl,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        category: recipe.category,
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
