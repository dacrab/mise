import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/recipe/Dashboard";

export const Route = createFileRoute("/_authed/dashboard/")({
  component: Dashboard,
});
