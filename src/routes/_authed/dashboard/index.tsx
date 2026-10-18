import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { pageHead } from "@/lib/route";

const searchSchema = z.object({ tab: z.enum(["my-recipes", "saved"]).optional().catch(undefined) });

export const Route = createFileRoute("/_authed/dashboard/")({
  validateSearch: searchSchema,
  head: () => pageHead("Dashboard", "Manage your recipes, drafts, and saved bookmarks."),
  component: DashboardView,
});
