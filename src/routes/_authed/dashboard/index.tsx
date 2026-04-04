import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DashboardView } from "@/components/dashboard/DashboardView";

const searchSchema = z.object({ tab: z.string().optional() });

export const Route = createFileRoute("/_authed/dashboard/")({
  validateSearch: searchSchema.parse,
  component: DashboardView,
});
