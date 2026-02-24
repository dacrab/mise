import { describe, it, expect } from "vitest";
import { scaleIngredient, formatNumber } from "@/lib/recipe";

describe("formatNumber", () => {
  it("returns whole numbers as strings", () => {
    expect(formatNumber(2)).toBe("2");
  });
  it("returns ½ for 0.5", () => {
    expect(formatNumber(0.5)).toBe("½");
  });
  it("returns 1½ for 1.5", () => {
    expect(formatNumber(1.5)).toBe("1½");
  });
  it("returns ¼ for 0.25", () => {
    expect(formatNumber(0.25)).toBe("¼");
  });
  it("returns ¾ for 0.75", () => {
    expect(formatNumber(0.75)).toBe("¾");
  });
  it("falls back to decimal for non-fraction values", () => {
    expect(formatNumber(0.6)).toBe("0.6");
  });
});

describe("scaleIngredient", () => {
  it("scales a whole number ingredient", () => {
    expect(scaleIngredient("2 cups flour", 2)).toBe("4 cups flour");
  });
  it("scales a fractional ingredient", () => {
    expect(scaleIngredient("1/2 cup sugar", 2)).toBe("1 cup sugar");
  });
  it("scales a decimal ingredient", () => {
    expect(scaleIngredient("1.5 tsp salt", 2)).toBe("3 tsp salt");
  });
  it("leaves non-numeric text unchanged", () => {
    expect(scaleIngredient("a pinch of salt", 3)).toBe("a pinch of salt");
  });
  it("handles scale factor of 1 (identity)", () => {
    expect(scaleIngredient("2 eggs", 1)).toBe("2 eggs");
  });
  it("handles scale factor < 1 (halving)", () => {
    expect(scaleIngredient("2 cups milk", 0.5)).toBe("1 cups milk");
  });
  it("uses fraction symbol when result is a vulgar fraction", () => {
    expect(scaleIngredient("1 cup", 0.5)).toBe("½ cup");
  });
});
