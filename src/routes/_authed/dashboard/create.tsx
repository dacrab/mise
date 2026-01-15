import { createFileRoute } from "@tanstack/react-router";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/create")({
  component: RecipeEditor,
});
