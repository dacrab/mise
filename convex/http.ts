import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";

const SITE_URL = process.env["SITE_URL"] ?? "https://mise.cooking";

const http = httpRouter();

http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const recipes = await ctx.runQuery(api.recipes.listSlugs, {});

    const staticPages = [
      { loc: "/", priority: "1.0" },
      { loc: "/about", priority: "0.5" },
      { loc: "/privacy", priority: "0.3" },
      { loc: "/terms", priority: "0.3" },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map((p) => `  <url><loc>${SITE_URL}${p.loc}</loc><priority>${p.priority}</priority></url>`).join("\n")}
${recipes
  .map(
    (r) =>
      `  <url><loc>${SITE_URL}/recipe/${r.slug}</loc><lastmod>${new Date(r.updatedAt).toISOString().split("T")[0]}</lastmod><priority>0.8</priority></url>`,
  )
  .join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
    });
  }),
});

export default http;
