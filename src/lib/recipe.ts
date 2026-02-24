/**
 * Pure recipe utility functions — importable by both components and tests.
 * No React, no Convex, no side effects.
 */

const FRACTIONS: Array<[number, string]> = [
  [0.125, "⅛"],
  [0.25, "¼"],
  [0.333, "⅓"],
  [0.5, "½"],
  [0.667, "⅔"],
  [0.75, "¾"],
];

/** Format a number as a human-readable quantity, using vulgar fraction symbols where appropriate. */
export function formatNumber(n: number): string {
  if (n === 0) return "0";
  if (n === Math.floor(n)) return n.toString();
  const whole = Math.floor(n);
  const decimal = n - whole;
  for (const [val, symbol] of FRACTIONS) {
    if (Math.abs(decimal - val) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

/**
 * Scale a single ingredient string by `scale`.
 * Handles integers, decimals, and fractions (e.g. "1/2", "2 1/4").
 */
export function scaleIngredient(ingredient: string, scale: number): string {
  return ingredient.replace(/(\d+\/\d+|\d+\.?\d*)/g, (match) => {
    if (match.includes("/")) {
      const [numStr, denStr] = match.split("/");
      const num = parseFloat(numStr ?? "0");
      const den = parseFloat(denStr ?? "1");
      return formatNumber((num / den) * scale);
    }
    return formatNumber(parseFloat(match) * scale);
  });
}

/** Format seconds as "m:ss". */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Score password strength 0–4. */
export function calculatePasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

/** Extract a human-readable message from an unknown error value. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong";
}
