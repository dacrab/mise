const FRACTIONS: [number, string][] = [
  [0.125, "⅛"],
  [0.25, "¼"],
  [0.333, "⅓"],
  [0.5, "½"],
  [0.667, "⅔"],
  [0.75, "¾"],
];

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (Number.isInteger(n)) return n.toString();
  const whole = Math.floor(n);
  const decimal = n - whole;
  for (const [value, symbol] of FRACTIONS) {
    if (Math.abs(decimal - value) < 0.03) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

export function scaleIngredient(ingredient: string, scale: number): string {
  return ingredient.replace(/(\d+\/\d+|\d+\.?\d*)/g, (match) => {
    if (match.includes("/")) {
      const [numerator = "0", denominator = "1"] = match.split("/");
      return formatNumber((Number.parseFloat(numerator) / Number.parseFloat(denominator)) * scale);
    }
    return formatNumber(Number.parseFloat(match) * scale);
  });
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatDate(timestamp: number): string {
  return dateFormatter.format(new Date(timestamp));
}

export function formatShortDate(timestamp: number): string {
  return shortDateFormatter.format(new Date(timestamp));
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}

export function safeRedirect(value?: string): string | undefined {
  if (!value?.startsWith("/") || value.startsWith("//")) return undefined;
  return /[\\\s]/.test(value) ? undefined : value;
}
