import { createFileRoute } from "@tanstack/react-router";
import { DashboardView } from "@/components/dashboard";

export const Route = createFileRoute("/_authed/dashboard/")({
  component: DashboardView,
});
