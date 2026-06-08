/// <reference types="node" />
import * as Sentry from "@sentry/node";

export function initServerSentry() {
  Sentry.init({
    dsn: process.env["SENTRY_DSN"],
    environment: process.env["VERCEL_ENV"] || process.env["NODE_ENV"] || "development",
    tracesSampleRate: 0.1,
    debug: false,
  });
}
