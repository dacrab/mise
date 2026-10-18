import { createFileRoute } from "@tanstack/react-router";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";
import { pageHead } from "@/lib/route";

export const Route = createFileRoute("/_authed/dashboard/create")({
  head: () => pageHead("Create Recipe", "Share a new recipe with the Mise community."),
  component: RecipeEditor,
});
