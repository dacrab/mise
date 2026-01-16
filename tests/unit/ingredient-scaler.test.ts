import { describe, it, expect } from "vitest";

// Test the ingredient scaling logic
function scaleIngredient(ingredient: string, scale: number): string {
  return ingredient.replace(/(\d+\/\d+|\d+\.?\d*)/g, (match) => {
    if (match.includes("/")) {
      const [num, den] = match.split("/").map(Number);
      const scaled = ((num ?? 0) / (den ?? 1)) * scale;
      return formatNumber(scaled);
    }
    const scaled = parseFloat(match) * scale;
    return formatNumber(scaled);
  });
}

function formatNumber(n: number): string {
  if (n === Math.floor(n)) return n.toString();
  const fractions: [number, string][] = [
    [0.25, "¼"], [0.33, "⅓"], [0.5, "½"], [0.66, "⅔"], [0.75, "¾"],
  ];
  const whole = Math.floor(n);
  const decimal = n - whole;
  for (const [val, symbol] of fractions) {
    if (Math.abs(decimal - val) < 0.05) {
      return whole > 0 ? `${whole}${symbol}` : symbol;
    }
  }
  return n.toFixed(1).replace(/\.0$/, "");
}

describe("IngredientScaler", () => {
  describe("scaleIngredient", () => {
    it("scales whole numbers", () => {
      expect(scaleIngredient("2 cups flour", 2)).toBe("4 cups flour");
      expect(scaleIngredient("1 egg", 3)).toBe("3 egg");
    });

    it("scales fractions", () => {
      expect(scaleIngredient("1/2 cup milk", 2)).toBe("1 cup milk");
      expect(scaleIngredient("1/4 tsp salt", 2)).toBe("½ tsp salt");
    });

    it("scales decimals", () => {
      expect(scaleIngredient("1.5 cups sugar", 2)).toBe("3 cups sugar");
    });

    it("handles scale down", () => {
      expect(scaleIngredient("4 cups flour", 0.5)).toBe("2 cups flour");
    });

    it("preserves text without numbers", () => {
      expect(scaleIngredient("salt to taste", 2)).toBe("salt to taste");
    });

    it("handles multiple numbers", () => {
      expect(scaleIngredient("2-3 cloves garlic", 2)).toBe("4-6 cloves garlic");
    });
  });

  describe("formatNumber", () => {
    it("formats whole numbers", () => {
      expect(formatNumber(4)).toBe("4");
      expect(formatNumber(10)).toBe("10");
    });

    it("formats common fractions", () => {
      expect(formatNumber(0.5)).toBe("½");
      expect(formatNumber(0.25)).toBe("¼");
      expect(formatNumber(0.75)).toBe("¾");
    });

    it("formats mixed numbers", () => {
      expect(formatNumber(1.5)).toBe("1½");
      expect(formatNumber(2.25)).toBe("2¼");
    });

    it("formats uncommon decimals", () => {
      expect(formatNumber(1.7)).toBe("1⅔");
      expect(formatNumber(0.15)).toBe("0.1");
    });
  });
});
