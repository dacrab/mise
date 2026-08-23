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
      const [numStr, denStr] = match.split("/") as [string, string];
      const num = parseFloat(numStr);
      const den = parseFloat(denStr);
      return formatNumber((num / den) * scale);
    }
    return formatNumber(parseFloat(match) * scale);
  });
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

export function safeRedirect(value?: string): string | undefined {
  if (!value) return undefined;
  // Reject protocol-relative URLs (//host) to prevent open redirects
  return value.startsWith("/") && !value.startsWith("//") ? value : undefined;
}
