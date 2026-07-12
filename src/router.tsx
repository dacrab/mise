import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ToastProvider } from "@/components/ui/Toast";
import { BookmarksProvider } from "@/lib/bookmarks";
import { routeTree } from "./routeTree.gen";

const CONVEX_URL = import.meta.env["VITE_CONVEX_URL"] as string;
if (!CONVEX_URL) throw new Error("Missing VITE_CONVEX_URL");

function createAppRouter() {
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        staleTime: 0,
        gcTime: 1000 * 60 * 5,
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    context: { queryClient },
    scrollRestoration: true,
    Wrap: ({ children }) => (
      <ConvexAuthProvider client={convexQueryClient.convexClient}>
        <ToastProvider>
          <BookmarksProvider>{children}</BookmarksProvider>
        </ToastProvider>
      </ConvexAuthProvider>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

// Singleton on client — preserves WS connection and auth state across navigations.
// On the server, always create fresh to avoid locked ReadableStream serialization.
let clientRouter: ReturnType<typeof createAppRouter> | undefined;

export function getRouter() {
  if (typeof document !== "undefined") {
    if (!clientRouter) clientRouter = createAppRouter();
    return clientRouter;
  }
  return createAppRouter();
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
