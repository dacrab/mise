import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ToastProvider } from "@/components/ui/Toast";
import { routeTree } from "./routeTree.gen";

const CONVEX_URL = import.meta.env["VITE_CONVEX_URL"] as string;
if (!CONVEX_URL) throw new Error("Missing VITE_CONVEX_URL");

const convexQueryClient = new ConvexQueryClient(CONVEX_URL);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});
convexQueryClient.connect(queryClient);

export const router = routerWithQueryClient(
  createRouter({
    routeTree,
    defaultPreload: "intent",
    context: { queryClient },
    scrollRestoration: true,
    Wrap: ({ children }) => (
      <ConvexAuthProvider client={convexQueryClient.convexClient}>
        <ToastProvider>{children}</ToastProvider>
      </ConvexAuthProvider>
    ),
  }),
  queryClient
);

export function getRouter() {
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
