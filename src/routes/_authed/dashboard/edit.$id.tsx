import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/edit/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    const recipe = await queryClient.ensureQueryData(convexQuery(api.recipes.getById, { id: params.id as Id<"recipes"> }));
    if (!recipe) throw redirect({ to: "/dashboard", replace: true });
  },
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  const { data: recipe } = useSuspenseQuery(convexQuery(api.recipes.getById, { id: id as Id<"recipes"> }));
  // Loader redirects to /dashboard if recipe is null — type guard for TS
  if (!recipe) return null;
  return <RecipeEditor initialData={{ id: recipe._id, ...recipe }} isEditing />;
}
