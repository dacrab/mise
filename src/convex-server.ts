import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Server-side Convex client for Astro pages
export function getConvexClient() {
  const url = import.meta.env.PUBLIC_CONVEX_URL;
  if (!url) throw new Error("PUBLIC_CONVEX_URL not set");
  return new ConvexHttpClient(url);
}

// Re-export api for convenience
export { api };
