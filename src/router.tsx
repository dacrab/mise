import { ClerkProvider, useAuth } from "@clerk/tanstack-react-start";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { Authenticated, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ToastProvider } from "@/components/ui/Toast";
import { BookmarksProvider } from "@/lib/bookmarks";
import { routeTree } from "./routeTree.gen";

function env(key: string) {
  const val = import.meta.env[key];
  if (typeof val !== "string" || !val) throw new Error(`Missing ${key}`);
  return val;
}

const CONVEX_URL = env("VITE_CONVEX_URL");

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
      <ClerkProvider publishableKey={env("VITE_CLERK_PUBLISHABLE_KEY")}>
        <ConvexProviderWithClerk client={convexQueryClient.convexClient} useAuth={useAuth}>
          {/* Anonymous visitors skip the myBookmarks subscription entirely */}
          <Authenticated>
            <BookmarksProvider>
              <ToastProvider>{children}</ToastProvider>
            </BookmarksProvider>
          </Authenticated>
          <Unauthenticated>
            <ToastProvider>{children}</ToastProvider>
          </Unauthenticated>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    ),
  });

  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
}

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
