import { describe, expect, it } from "vitest";
import { formatNumber, scaleIngredient } from "@/lib/utils";

describe("formatNumber edge cases", () => {
  it("returns '0' for zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("handles large whole numbers", () => {
    expect(formatNumber(100)).toBe("100");
  });

  it("handles 1/8 fraction", () => {
    expect(formatNumber(0.125)).toBe("⅛");
  });

  it("handles 2/3 fraction", () => {
    expect(formatNumber(0.667)).toBe("⅔");
  });

  it("handles whole + fraction", () => {
    expect(formatNumber(2.5)).toBe("2½");
  });

  it("falls back to decimal for unrecognized fractions", () => {
    expect(formatNumber(0.42)).toBe("0.4");
  });
});

describe("scaleIngredient compound", () => {
  it("scales multiple numbers in one string", () => {
    expect(scaleIngredient("2-3 cups flour", 2)).toBe("4-6 cups flour");
  });

  it("handles scale of 1 (identity)", () => {
    expect(scaleIngredient("1 cup milk", 1)).toBe("1 cup milk");
  });

  it("handles fractional scale down", () => {
    expect(scaleIngredient("4 cups water", 0.25)).toBe("1 cups water");
  });

  it("handles mixed fraction input", () => {
    expect(scaleIngredient("1/4 tsp vanilla", 4)).toBe("1 tsp vanilla");
  });
});
