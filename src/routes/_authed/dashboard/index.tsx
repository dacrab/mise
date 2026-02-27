import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard";

export const Route = createFileRoute("/_authed/dashboard/")({
  component: Dashboard,
});
