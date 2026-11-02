import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { initServerSentry } from "./sentry.server";

initServerSentry();

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.mise.cooking https://challenges.cloudflare.com https://*.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.convex.cloud https://*.convex.site https://img.clerk.com https://*.clerk.com https://clerk.mise.cooking",
  "font-src 'self' data:",
  "connect-src 'self' https://*.convex.cloud https://*.convex.site wss://*.convex.cloud wss://*.convex.site https://*.clerk.accounts.dev https://*.clerk.com https://clerk.mise.cooking https://*.clerk-telemetry.com https://*.sentry.io https://*.ingest.sentry.io https://vitals.vercel-insights.com",
  "frame-src 'self' https://challenges.cloudflare.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.mise.cooking",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

const isProduction = process.env["NODE_ENV"] === "production";
const handler = createStartHandler(defaultStreamHandler);

export default {
  async fetch(request: Request): Promise<Response> {
    const response = await handler(request);

    for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
    if (isProduction) {
      response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
    }

    return response;
  },
};
