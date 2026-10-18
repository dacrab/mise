import { z } from "zod";
import { APP_TITLE_SUFFIX } from "@/lib/constants";

/** Standard `<title>` + meta description for a page. */
export function pageHead(title: string, description: string) {
  return {
    meta: [{ title: `${title}${APP_TITLE_SUFFIX}` }, { name: "description", content: description }],
  };
}

/** Shared `?redirect=` search param for the auth routes. */
export const redirectSearchSchema = z.object({ redirect: z.string().optional() });
