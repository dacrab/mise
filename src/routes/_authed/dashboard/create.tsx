import { createFileRoute } from "@tanstack/react-router";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/create")({
  head: () => ({
    meta: [
      { title: "Create Recipe | Mise" },
      { name: "description", content: "Share a new recipe with the Mise community." },
    ],
  }),
  component: RecipeEditor,
});
