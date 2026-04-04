"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";

const BLOCKED_HOSTNAMES = new Set(["localhost", "metadata.google.internal"]);

const BLOCKED_IP_PREFIXES = [
  "169.254.",
  "10.",
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.`),
  "192.168.",
  "127.",
  "::1",
  "fc",
  "fd",
];

function assertSafeUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Only HTTPS URLs are supported");
  }
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(host)) {
    throw new Error("URL not allowed");
  }
  for (const prefix of BLOCKED_IP_PREFIXES) {
    if (host.startsWith(prefix)) {
      throw new Error("URL not allowed");
    }
  }
  return parsed;
}

const MAX_BODY_BYTES = 5 * 1024 * 1024;

export const importFromUrl = action({
  args: { url: v.string() },
  handler: async (_, { url }) => {
    const safeUrl = assertSafeUrl(url);

    const res = await fetch(safeUrl.toString(), {
      headers: { "User-Agent": "Mise Recipe Importer/1.0" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error("Failed to fetch URL");

    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      throw new Error("Page too large to import");
    }

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BODY_BYTES) {
      throw new Error("Page too large to import");
    }
    const html = new TextDecoder().decode(buffer);

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatch) {
      for (const match of jsonLdMatch) {
        try {
          const json = match.replace(/<\/?script[^>]*>/gi, "");
          const data = JSON.parse(json);
          let recipe = null;
          if (Array.isArray(data)) {
            recipe = data.find((d: { "@type"?: string }) => d["@type"] === "Recipe");
          } else if (data["@type"] === "Recipe") {
            recipe = data;
          }

          if (recipe) {
            return {
              title: recipe.name || "",
              description: recipe.description || "",
              ingredients: (recipe.recipeIngredient ?? []).map((i: string) => i.trim()),
              steps: (recipe.recipeInstructions ?? [])
                .map((s: { text?: string } | string) => (typeof s === "string" ? s.trim() : s.text?.trim() ?? ""))
                .filter(Boolean),
              prepTime: parseTime(recipe.prepTime),
              cookTime: parseTime(recipe.cookTime),
              servings: parseInt(recipe.recipeYield, 10) || undefined,
              imageUrl: typeof recipe.image === "string" ? recipe.image : recipe.image?.[0] || recipe.image?.url,
              source: url,
            };
          }
        } catch {
          // malformed JSON-LD block — try next match
        }
      }
    }

    throw new Error("Could not extract recipe from URL. Try a site with structured recipe data.");
  },
});

function parseTime(iso?: string): number | undefined {
  if (!iso) return undefined;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return undefined;
  return parseInt(match[1] ?? "0", 10) * 60 + parseInt(match[2] ?? "0", 10);
}
