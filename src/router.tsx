import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ToastProvider } from "@/components/ui/Toast";
import { routeTree } from "./routeTree.gen";

// Create a single shared router instance. Calling getRouter() inside a render
// would create new QueryClient/ConvexQueryClient instances on every render,
// causing the Wrap component to unmount+remount and wiping all auth state.
function createAppRouter() {
  const CONVEX_URL = import.meta.env["VITE_CONVEX_URL"];
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

  // Capture stable references so the Wrap closure never changes identity.
  const convexClient = convexQueryClient.convexClient;

  return routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: "intent",
      context: { queryClient },
      scrollRestoration: true,
      Wrap: ({ children }) => (
        <ConvexAuthProvider client={convexClient}>
          <ToastProvider>{children}</ToastProvider>
        </ConvexAuthProvider>
      ),
    }),
    queryClient
  );
}

// Singleton — evaluated once per JS module load, not per render.
export const router = createAppRouter();

// Required named export for @tanstack/start-client-core — do not remove.
export function getRouter() {
  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
