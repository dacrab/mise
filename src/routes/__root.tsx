/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { ErrorPage } from "@/components/ui/Layout";
import appCss from "../styles.css?url";

function RootComponent() {
  const { isLoading } = useRouterState();
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {isLoading && <div className="fixed top-0 left-0 w-full h-px bg-sage animate-pulse z-50" />}
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        <ErrorPage title="Something went wrong" message={error.message || "An unexpected error occurred"} />
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mise - Share Your Recipes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Caveat:wght@400;500;600&display=swap" },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: () => <ErrorPage title="Page not found" />,
});
