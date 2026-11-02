/// <reference types="vite/client" />

import * as Sentry from "@sentry/react";
import type { QueryClient } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { createRootRouteWithContext, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import appCss from "../styles.css?url";

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static pre-hydration theme script, no user input
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Sentry.ErrorBoundary fallback={<ErrorPage title="Something went wrong" />}>
          <Outlet />
        </Sentry.ErrorBoundary>
        <Analytics />
        <SpeedInsights />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorPage({ title, message }: { title: string; message?: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
          {APP_NAME}
        </Link>
        <h1 className="mt-10 text-4xl font-medium tracking-[-0.02em]">{title}</h1>
        {message && <p className="mt-4 leading-relaxed text-ink-soft">{message}</p>}
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/" className="btn-primary">
            Back to recipes
          </Link>
        </div>
      </div>
    </main>
  );
}

function RootErrorComponent({ error }: ErrorComponentProps) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorPage
          title="Something went wrong"
          message={error instanceof Error ? error.message : "An unexpected error occurred."}
        />
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
      { title: `${APP_NAME} — A recipe journal for home cooks` },
      { name: "description", content: APP_DESCRIPTION },
      { name: "theme-color", content: "#f7f3ec" },
      { name: "theme-color", content: "#12110f", media: "(prefers-color-scheme: dark)" },
      { name: "color-scheme", content: "light dark" },
      { property: "og:title", content: `${APP_NAME} — A recipe journal for home cooks` },
      { property: "og:description", content: APP_DESCRIPTION },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: () => <ErrorPage title="Page not found" message="The page you were looking for isn't here." />,
});
