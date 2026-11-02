import { convexQuery } from "@convex-dev/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { api } from "convex/_generated/api";
import { z } from "zod";
import { HomePage } from "@/components/home/HomePage";
import { CATEGORIES, FEED_PAGE_SIZE } from "@/lib/constants";
import { pageHead } from "@/lib/route";

const searchSchema = z.object({
  q: z.string().trim().optional().catch(undefined),
  category: z.enum(CATEGORIES).optional().catch(undefined),
});

export const Route = createFileRoute("/")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ q: search.q, category: search.category }),
  loader: async ({ context: { queryClient }, deps }) => {
    await queryClient.ensureQueryData(
      convexQuery(api.recipes.list, {
        paginationOpts: { numItems: FEED_PAGE_SIZE, cursor: null },
        search: deps.q || undefined,
        category: deps.category,
      }),
    );
  },
  component: HomeRoute,
  head: () =>
    pageHead(
      "Recipes made to be shared",
      "Discover and share recipes from home cooks. No ads, no algorithms — just good food.",
      "/",
    ),
});

function HomeRoute() {
  const { q, category } = Route.useSearch();
  return <HomePage key={`${q ?? ""}|${category ?? ""}`} q={q} category={category} />;
}
