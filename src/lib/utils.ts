const FRACTIONS: [number, string][] = [
  [0.125, "⅛"],
  [0.25, "¼"],
  [0.333, "⅓"],
  [0.5, "½"],
  [0.667, "⅔"],
  [0.75, "¾"],
];

export function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (n === Math.floor(n)) return n.toString();
  const whole = Math.floor(n);
  const decimal = n - whole;
  for (const [val, symbol] of FRACTIONS) {
    if (Math.abs(decimal - val) < 0.03) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

export function scaleIngredient(ingredient: string, scale: number): string {
  return ingredient.replace(/(\d+\/\d+|\d+\.?\d*)/g, (match) => {
    if (match.includes("/")) {
      const [numStr = "0", denStr = "1"] = match.split("/");
      const num = parseFloat(numStr);
      const den = parseFloat(denStr);
      return formatNumber((num / den) * scale);
    }
    return formatNumber(parseFloat(match) * scale);
  });
}

/** Prefer the uploaded profile image, falling back to the Clerk avatar URL. */
export function avatarSource(
  user?: { image?: string | null; profileImageUrl?: string | null } | null,
): string | undefined {
  return user?.profileImageUrl ?? user?.image ?? undefined;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

/** Narrow an unknown value to a plain object; null for arrays and primitives. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function safeRedirect(value?: string): string | undefined {
  if (!value?.startsWith("/") || value.startsWith("//")) return undefined;
  // Browsers normalize backslashes to slashes and strip whitespace, so a value
  // like "/\evil.com" would resolve cross-origin. Only accept clean local paths.
  return /[\\\s]/.test(value) ? undefined : value;
}
