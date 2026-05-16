/**
 * Application Router Configuration
 * 
 * This file implements TanStack Start's SSR-optimized router pattern with Convex integration.
 * 
 * ## Architecture Overview
 * 
 * ### Router Singleton Pattern (Client-Side Only)
 * - On the client, we maintain a single router instance across navigations
 * - This preserves the Convex WebSocket connection and authentication state
 * - Prevents reconnection overhead and auth flicker during client-side navigation
 * - On the server, we always create fresh instances to avoid serialization issues
 * 
 * ### Convex + React Query Integration
 * - ConvexQueryClient bridges Convex's real-time subscriptions with React Query
 * - Custom queryKeyHashFn and queryFn enable seamless Convex query caching
 * - SSR loaders use queryClient.ensureQueryData() to prefetch on the server
 * - Client components use useSuspenseQuery() to read from the cache without waterfalls
 * 
 * ### SSR Data Flow
 * 1. Server receives request → loader runs → ensureQueryData() fetches from Convex
 * 2. Server renders HTML with data → sends to client with dehydrated query cache
 * 3. Client hydrates → useSuspenseQuery() reads from cache (no loading state)
 * 4. WebSocket connects → real-time updates begin
 * 
 * ## When to Use SSR vs Client-Side Loading
 * 
 * ### Use SSR (loader + useSuspenseQuery) for:
 * - Public content pages (recipes, chef profiles, home)
 * - SEO-critical pages that need meta tags and Open Graph data
 * - Pages where fast First Contentful Paint (FCP) matters
 * - Content that should be visible without JavaScript
 * 
 * ### Use Client-Side Loading (useQuery) for:
 * - Authenticated-only pages (dashboard, settings)
 * - Interactive features (search, filters, pagination)
 * - Real-time data that changes frequently
 * - Content below the fold or behind user interactions
 * 
 * ## Example SSR Route Pattern
 * 
 * ```tsx
 * export const Route = createFileRoute("/recipe/$slug")({
 *   // 1. Loader prefetches data on the server
 *   loader: ({ params, context: { queryClient } }) =>
 *     queryClient.ensureQueryData(convexQuery(api.recipes.getBySlug, { slug: params.slug })),
 * 
 *   // 2. Component reads from cache (no loading state on SSR)
 *   component: () => {
 *     const { slug } = Route.useParams();
 *     const { data } = useSuspenseQuery(convexQuery(api.recipes.getBySlug, { slug }));
 *     return <div>{data.title}</div>;
 *   },
 * 
 *   // 3. Error boundary handles loader failures gracefully
 *   errorComponent: ({ error, reset }) => <RouteError error={error} reset={reset} />,
 * 
 *   // 4. Head function sets meta tags from loader data
 *   head: ({ loaderData }) => ({
 *     meta: [
 *       { title: loaderData?.title },
 *       { property: "og:title", content: loaderData?.title },
 *     ],
 *   }),
 * });
 * ```
 * 
 * ## Testing SSR
 * 
 * To verify SSR is working:
 * 1. Build: `bun run build`
 * 2. Preview: `bun run start`
 * 3. View source: Right-click → "View Page Source" (not Inspect Element)
 * 4. Verify: HTML should contain recipe/chef data, not just loading states
 * 5. Disable JS: DevTools → Settings → Debugger → Disable JavaScript
 * 6. Reload: Content should still be visible (though not interactive)
 * 
 * ## Performance Considerations
 * 
 * - Loaders run in parallel for nested routes
 * - Query cache is dehydrated and sent to client (adds ~2-5KB per query)
 * - WebSocket connection is established after hydration (not during SSR)
 * - Real-time updates only work client-side (SSR serves static snapshot)
 */

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
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
      <ConvexAuthProvider client={convexQueryClient.convexClient}>
        <ToastProvider>{children}</ToastProvider>
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
