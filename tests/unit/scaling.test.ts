import { describe, expect, it } from "vitest";
import { formatNumber, scaleIngredient } from "@/lib/utils";

describe("formatNumber", () => {
  it.each([
    [0, "0"],
    [2, "2"],
    [100, "100"],
    [0.125, "⅛"],
    [0.25, "¼"],
    [0.333, "⅓"],
    [0.35, "⅓"],
    [0.5, "½"],
    [0.6, "0.6"],
    [0.667, "⅔"],
    [0.75, "¾"],
    [0.42, "0.4"],
    [1.5, "1½"],
    [2.5, "2½"],
    [1.333, "1⅓"],
    [10.0, "10"],
  ])("formatNumber(%f) → %s", (input, expected) => {
    expect(formatNumber(input)).toBe(expected);
  });
});

describe("scaleIngredient", () => {
  it.each([
    ["2 cups flour", 2, "4 cups flour"],
    ["1/2 cup sugar", 2, "1 cup sugar"],
    ["1.5 tsp salt", 2, "3 tsp salt"],
    ["2-3 cups flour", 2, "4-6 cups flour"],
    ["1 cup milk", 1, "1 cup milk"],
    ["4 cups water", 0.25, "1 cups water"],
    ["1/4 tsp vanilla", 4, "1 tsp vanilla"],
    ["1/3 cup rice", 3, "1 cup rice"],
    ["1/8 tsp nutmeg", 2, "¼ tsp nutmeg"],
    ["1 cup", 0.5, "½ cup"],
    ["a pinch of salt", 3, "a pinch of salt"],
    ["", 2, ""],
  ])("scaleIngredient(%s, %f) → %s", (ingredient, scale, expected) => {
    expect(scaleIngredient(ingredient, scale)).toBe(expected);
  });
});
