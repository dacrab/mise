export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
