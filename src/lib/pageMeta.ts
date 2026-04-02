export function buildPageHead(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
    ],
  };
}
