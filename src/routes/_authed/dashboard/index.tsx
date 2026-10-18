import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

const searchSchema = z.object({ tab: z.enum(["my-recipes", "saved"]).optional().catch(undefined) });

export const Route = createFileRoute("/_authed/dashboard/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: `Dashboard${APP_TITLE_SUFFIX}` },
      { name: "description", content: "Manage your recipes, drafts, and saved bookmarks." },
    ],
  }),
  component: DashboardView,
});
