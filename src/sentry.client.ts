import * as Sentry from "@sentry/react";

export function initClientSentry() {
  if (typeof window !== "undefined") {
    Sentry.init({
      dsn: import.meta.env["VITE_SENTRY_DSN"],
      environment: import.meta.env["VITE_VERCEL_ENV"] || import.meta.env.MODE || "development",
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: 1.0,
      debug: false,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    });
  }
}
