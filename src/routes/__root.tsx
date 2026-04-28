/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ErrorPage } from "@/components/layout/PageLayout";
import appCss from "../styles.css?url";

function RootComponent() {
  const { isLoading, location } = useRouterState();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname === prevPathRef.current) return;
    prevPathRef.current = location.pathname;

    const el = wrapperRef.current;
    if (!el) return;

    el.classList.remove("page-enter");
    requestAnimationFrame(() => el.classList.add("page-enter"));

    const timer = setTimeout(() => el.classList.remove("page-enter"), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {isLoading && (
          <div className="fixed top-0 left-0 w-full h-0.5 bg-gradient-to-r from-sage via-sage-light to-sage z-50 animate-pulse" />
        )}
        <div ref={wrapperRef}>
          <Outlet />
        </div>
        <Analytics />
        <Scripts />
      </body>
    </html>
  );
}

function RootErrorComponent({ error }: { error: Error }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorPage title="Something went wrong" message={error.message || "Unexpected error"} />
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
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      // preconnect shaves ~100ms off first Google Fonts request
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=Caveat:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: () => <ErrorPage title="Page not found" />,
});
