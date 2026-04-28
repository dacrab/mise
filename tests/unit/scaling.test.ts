import { describe, expect, it } from "vitest";
import { formatNumber, scaleIngredient } from "@/lib/utils";

describe("formatNumber", () => {
  it.each([
    [2, "2"],
    [0.5, "½"],
    [1.5, "1½"],
    [0.25, "¼"],
    [0.75, "¾"],
    [0.35, "⅓"],
    [0.6, "0.6"],
  ])("formatNumber(%f) → %s", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });
});

describe("scaleIngredient", () => {
  it("scales whole numbers", () => {
    expect(scaleIngredient("2 cups flour", 2)).toBe("4 cups flour");
  });
  it("scales fractions", () => {
    expect(scaleIngredient("1/2 cup sugar", 2)).toBe("1 cup sugar");
  });
  it("scales decimals", () => {
    expect(scaleIngredient("1.5 tsp salt", 2)).toBe("3 tsp salt");
  });
  it("leaves non-numeric text unchanged", () => {
    expect(scaleIngredient("a pinch of salt", 3)).toBe("a pinch of salt");
  });
  it("uses vulgar fractions for results", () => {
    expect(scaleIngredient("1 cup", 0.5)).toBe("½ cup");
  });
});
