import { z } from "zod";
import { APP_NAME, APP_TITLE_SUFFIX } from "@/lib/constants";

export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title}${APP_TITLE_SUFFIX}` },
      { name: "description", content: description },
      { property: "og:title", content: `${title}${APP_TITLE_SUFFIX}` },
      { property: "og:description", content: description },
      { property: "og:site_name", content: APP_NAME },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  };
}

export const redirectSearchSchema = z.object({ redirect: z.string().optional() });
