import { APP_TITLE_SUFFIX } from "@/lib/constants";

/** Standard `<title>` + meta description for a page. */
export function pageHead(title: string, description: string) {
  return {
    meta: [{ title: `${title}${APP_TITLE_SUFFIX}` }, { name: "description", content: description }],
  };
}
