/**
 * Application Router Configuration
 *
 * - Client: singleton router preserves Convex WebSocket across navigations
 * - Server: fresh instance per request to avoid serialization issues
 * - SSR loaders use ensureQueryData() for prefetching; components use useSuspenseQuery()
 */

import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ToastProvider } from "@/components/ui/Toast";
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
      <ClerkProvider publishableKey={import.meta.env["VITE_CLERK_PUBLISHABLE_KEY"] as string}>
        <ConvexProviderWithClerk client={convexQueryClient.convexClient} useAuth={useAuth}>
          <ToastProvider>{children}</ToastProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
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
