import { z } from "zod";
import { APP_NAME, APP_TITLE_SUFFIX, SITE_URL } from "@/lib/constants";

export function pageHead(title: string, description: string, path = "/") {
  const url = new URL(path, SITE_URL).toString();

  return {
    meta: [
      { title: `${title}${APP_TITLE_SUFFIX}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title}${APP_TITLE_SUFFIX}` },
      { property: "og:description", content: description },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export const redirectSearchSchema = z.object({ redirect: z.string().optional() });
