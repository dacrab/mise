import { createFileRoute } from "@tanstack/react-router";
import { APP_TITLE_SUFFIX } from "@/lib/constants";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/create")({
  head: () => ({
    meta: [
      { title: `Create Recipe${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Share a new recipe with the Mise community." },
    ],
  }),
  component: RecipeEditor,
});
