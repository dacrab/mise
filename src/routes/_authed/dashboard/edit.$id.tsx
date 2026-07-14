import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";
import { convexId } from "@/lib/utils";

export const Route = createFileRoute("/_authed/dashboard/edit/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    const recipe = await queryClient.ensureQueryData(
      convexQuery(api.recipes.getById, { id: convexId<"recipes">(params.id) }),
    );
    if (!recipe) throw redirect({ to: "/dashboard", replace: true });
  },
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getById, { id: convexId<"recipes">(id) }));
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
