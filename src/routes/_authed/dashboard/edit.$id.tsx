import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { RecipeEditor } from "@/components/recipe/RecipeEditor";

export const Route = createFileRoute("/_authed/dashboard/edit/$id")({
  component: EditRecipePage,
});

function EditRecipePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const recipe = useQuery(api.recipes.getById, { id: id as Id<"recipes"> });
  const user = useQuery(api.users.currentUser);

  // Stable primitives — satisfies @tanstack/query/no-unstable-deps
  const userIsNull = user === null;
  const loaded = recipe !== undefined && user !== undefined;
  const isOwner = !!recipe && recipe.userId === user?._id;

  useEffect(() => {
    if (userIsNull) void navigate({ to: "/login", replace: true });
  }, [userIsNull, navigate]);

  useEffect(() => {
    if (loaded && !isOwner) void navigate({ to: "/dashboard", replace: true });
  }, [loaded, isOwner, navigate]);

  if (!loaded) {
    return <div className="flex items-center justify-center min-h-[60vh] text-stone animate-pulse">Loading…</div>;
  }
  if (!isOwner) return null;

  return <RecipeEditor initialData={{ id: recipe._id, ...recipe }} isEditing />;
}
