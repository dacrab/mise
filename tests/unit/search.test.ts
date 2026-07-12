import { describe, expect, it } from "vitest";
import { filterRecipes } from "@/lib/search";

const recipes = [
  { title: "Spaghetti Carbonara", category: "Pasta", ingredients: ["eggs", "pecorino", "guanciale"] },
  { title: "Chicken Tikka", category: "Chicken", ingredients: ["yogurt", "chicken", "spices"] },
  { title: "Caesar Salad", category: "Salads", ingredients: ["romaine", "parmesan", "croutons"] },
];

describe("filterRecipes", () => {
  it("returns all recipes for empty query", () => {
    expect(filterRecipes(recipes, "")).toHaveLength(3);
  });
  it("filters by title", () => {
    expect(filterRecipes(recipes, "chicken")).toHaveLength(1);
    expect(filterRecipes(recipes, "Chicken")[0]?.title).toBe("Chicken Tikka");
  });
  it("filters by category", () => {
    expect(filterRecipes(recipes, "pasta")).toHaveLength(1);
  });
  it("filters by ingredient", () => {
    expect(filterRecipes(recipes, "eggs")).toHaveLength(1);
  });
  it("is case-insensitive", () => {
    expect(filterRecipes(recipes, "ROMaine")).toHaveLength(1);
  });
  it("returns empty array when nothing matches", () => {
    expect(filterRecipes(recipes, "xyz")).toHaveLength(0);
  });
  it("trims whitespace from query", () => {
    expect(filterRecipes(recipes, "  salad  ")).toHaveLength(1);
  });
});
